import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
import QRCode from 'qrcode';
import * as userRepository from '../repositories/userRepository';
import * as refreshTokenRepository from '../repositories/refreshTokenRepository';
import * as companyRepository from '../repositories/companyRepository';
import * as companySettingsRepository from '../repositories/companySettingsRepository';
import * as leaveTypeRepository from '../repositories/leaveTypeRepository';
import * as leaveBalanceRepository from '../repositories/leaveBalanceRepository';
import { prisma } from '../config/prismaClient';
import { PLATFORM_COMPANY_ID } from '../config/constants';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { LockedError } from '../errors/LockedError';
import { TwoFactorRequiredError } from '../errors/TwoFactorRequiredError';
import { ConflictError } from '../errors/ConflictError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { getContainer } from '../container';
import { logger } from '../config/logger';
import { env } from '../config/env';

const totp = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
  issuer: 'StaffAway',
});

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const TEMP_TOKEN_TTL = '5m';
const REFRESH_REUSE_GRACE_MS = 60 * 1000;

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

// A mail outage must not fail the request: the token is already saved and can be resent, and a
// 500 that only happens for existing accounts would tell anyone which emails are registered.
async function sendEmailSafely(send: () => Promise<void>) {
  try {
    await send();
  } catch (err) {
    logger.error({ err }, 'Failed to send email');
  }
}

function signAccessToken(user: { id: number; role: string; companyId: number }) {
  return jwt.sign({ userId: user.id, role: user.role, companyId: user.companyId }, env.JWT_SECRET, {
    expiresIn: '15m',
  });
}

function signTempToken(userId: number) {
  return jwt.sign({ userId, purpose: '2fa-pending' }, env.JWT_SECRET, {
    expiresIn: TEMP_TOKEN_TTL,
  });
}

async function issueTokensForUser(user: { id: number; role: string; companyId: number }) {
  const accessToken = signAccessToken(user);
  const refreshToken = generateRefreshToken();

  await refreshTokenRepository.createRefreshToken({
    userId: user.id,
    token: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return { accessToken, refreshToken };
}

const DUMMY_PASSWORD_HASH = '$2b$10$C6UzMDM.H6dfI/f/IKcEeO5cLDl6h.HOOrGqW9dR1MXwLXVWfHbf.';

function assertNotLocked(user: { lockedUntil: Date | null }) {
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new LockedError('Account is temporarily locked due to too many failed login attempts');
  }
}

// Wrong passwords and wrong 2FA codes share one counter, so neither can be guessed indefinitely.
async function registerFailedAttempt(user: { id: number; failedLoginAttempts: number }) {
  const attemptsAfterThis = user.failedLoginAttempts + 1;

  if (attemptsAfterThis >= MAX_FAILED_LOGIN_ATTEMPTS) {
    await userRepository.setAccountLock(user.id, new Date(Date.now() + LOCKOUT_DURATION_MS), 0);
    logger.warn({ userId: user.id }, 'Account locked after too many failed login attempts');
    throw new LockedError(
      'Account locked due to too many failed login attempts. Try again in 15 minutes.'
    );
  }

  await userRepository.incrementFailedLoginAttempts(user.id);
  logger.warn({ userId: user.id, attempt: attemptsAfterThis }, 'Failed login attempt');
}

async function clearFailedAttempts(user: {
  id: number;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}) {
  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await userRepository.setAccountLock(user.id, null, 0);
  }
}

export async function login(email: string, password: string) {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    logger.warn({ email }, 'Login attempt for unknown email');
    throw new UnauthorizedError('Invalid email or password');
  }

  assertNotLocked(user);

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    await registerFailedAttempt(user);
    throw new UnauthorizedError('Invalid email or password');
  }

  // Checked only after the password, so it reveals nothing to someone guessing emails.
  if (!user.emailVerified) {
    throw new ForbiddenError('Email address is not verified');
  }

  // With 2FA the counter is only cleared after the code, otherwise logging in again would reset
  // the count of wrong codes.
  if (user.twoFactorEnabled) {
    const tempToken = signTempToken(user.id);
    throw new TwoFactorRequiredError(tempToken);
  }

  await clearFailedAttempts(user);

  const { accessToken, refreshToken } = await issueTokensForUser(user);

  return { accessToken, refreshToken, user: userRepository.toSafeUser(user) };
}

// Enough for a new organization to request leave right away; Hr can change them later.
const DEFAULT_LEAVE_TYPES = [
  { name: 'Annual leave', requiresApproval: true, countsTowardBalance: true },
  { name: 'Sick leave', requiresApproval: false, countsTowardBalance: false },
];

export async function register(input: {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  // The unique index still decides a race; this only gives the common case a clear message.
  if (await userRepository.findUserByEmail(input.email)) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const rawToken = crypto.randomBytes(32).toString('hex');

  await prisma.$transaction(async (tx) => {
    const company = await companyRepository.createCompany({ name: input.companyName }, tx);
    // On an empty database the first company would get the platform id, and its Hr would manage
    // every tenant. That company is created by src/scripts/createAdmin.ts, never by sign-up.
    if (company.id === PLATFORM_COMPANY_ID) {
      throw new ConflictError('Registration is not available yet');
    }

    const settings = await companySettingsRepository.createCompanySettings(
      { companyId: company.id, companyName: company.name },
      tx
    );
    const leaveTypes = [];
    for (const leaveType of DEFAULT_LEAVE_TYPES) {
      leaveTypes.push(
        await leaveTypeRepository.createLeaveType({ ...leaveType, companyId: company.id }, tx)
      );
    }

    const hr = await userRepository.create(
      {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        passwordHash,
        role: 'Hr',
        managerId: null,
        hireDate: new Date(),
        companyId: company.id,
        emailVerified: false,
      },
      tx
    );
    await userRepository.setEmailVerificationToken(
      hr.id,
      hashToken(rawToken),
      new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
      tx
    );

    for (const leaveType of leaveTypes.filter((lt) => lt.countsTowardBalance)) {
      await leaveBalanceRepository.createLeaveBalance(
        {
          userId: hr.id,
          leaveTypeId: leaveType.id,
          companyId: company.id,
          year: new Date().getFullYear(),
          totalDays: settings.defaultAnnualLeaveDays,
          usedDays: 0,
        },
        tx
      );
    }
  });

  // After the commit, so a mail outage leaves a valid account whose link can be resent.
  await sendEmailSafely(() => getContainer().email.sendVerificationEmail(input.email, rawToken));
}

export async function verifyEmail(rawToken: string) {
  const user = await userRepository.findByEmailVerificationTokenHash(hashToken(rawToken));

  if (!user || !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired verification link');
  }

  await userRepository.markEmailVerified(user.id);

  // The link proves the mailbox, so it signs the user in like a login would.
  const { accessToken, refreshToken } = await issueTokensForUser(user);

  return { accessToken, refreshToken, user: userRepository.toSafeUser(user) };
}

export async function resendVerificationEmail(email: string) {
  const user = await userRepository.findUserByEmail(email);

  // Same response whether or not the account exists or is already verified (no enumeration).
  if (!user || user.emailVerified) {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  await userRepository.setEmailVerificationToken(
    user.id,
    hashToken(rawToken),
    new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)
  );
  await sendEmailSafely(() => getContainer().email.sendVerificationEmail(user.email, rawToken));
}

export async function verifyTwoFactorLogin(tempToken: string, code: string) {
  let payload: { userId: number; purpose: string };

  try {
    payload = jwt.verify(tempToken, env.JWT_SECRET, {
      algorithms: ['HS256'],
    }) as typeof payload;
  } catch {
    throw new UnauthorizedError('Invalid or expired temporary token');
  }

  if (payload.purpose !== '2fa-pending') {
    throw new UnauthorizedError('Invalid temporary token');
  }

  const user = await userRepository.findByIdWithAuthFields(payload.userId);
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new UnauthorizedError('Two-factor authentication is not enabled for this account');
  }

  assertNotLocked(user);

  const result = await totp.verify(code, { secret: user.twoFactorSecret });
  if (!result.valid) {
    await registerFailedAttempt(user);
    throw new UnauthorizedError('Invalid two-factor code');
  }
  // A code stays valid for its whole 30s window; it must not log in a second time.
  if (!(await userRepository.consumeTwoFactorTimeStep(user.id, result.timeStep))) {
    throw new UnauthorizedError('Invalid two-factor code');
  }

  await clearFailedAttempts(user);

  const { accessToken, refreshToken } = await issueTokensForUser(user);

  return { accessToken, refreshToken, user: userRepository.toSafeUser(user) };
}

export async function getCurrentUser(userId: number) {
  const user = await userRepository.findByIdWithAuthFields(userId);
  if (!user) {
    throw new UnauthorizedError('User no longer exists');
  }
  return { ...userRepository.toSafeUser(user), twoFactorEnabled: user.twoFactorEnabled };
}

export async function setupTwoFactor(userId: number) {
  const user = await userRepository.findByIdWithAuthFields(userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }
  // Replacing the secret of an enabled 2FA would let anyone holding a session take it over;
  // disabling first requires a valid code.
  if (user.twoFactorEnabled) {
    throw new ConflictError('Two-factor authentication is already enabled');
  }

  const secret = totp.generateSecret();
  await userRepository.setTwoFactorSecret(userId, secret);

  const otpauthUrl = totp.toURI({ label: user.email, secret });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  return { qrCodeDataUrl, secret };
}

export async function confirmTwoFactor(userId: number, code: string) {
  const user = await userRepository.findByIdWithAuthFields(userId);
  if (!user || !user.twoFactorSecret) {
    throw new UnauthorizedError('Two-factor setup was not initiated');
  }

  const result = await totp.verify(code, { secret: user.twoFactorSecret });
  if (!result.valid) {
    throw new UnauthorizedError('Invalid two-factor code');
  }

  await userRepository.enableTwoFactor(userId);
}
export async function disableTwoFactor(userId: number, code: string) {
  const user = await userRepository.findByIdWithAuthFields(userId);
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new UnauthorizedError('Two-factor authentication is not enabled for this account');
  }

  const result = await totp.verify(code, { secret: user.twoFactorSecret });
  if (!result.valid) {
    throw new UnauthorizedError('Invalid two-factor code');
  }

  await userRepository.disableTwoFactor(userId);
}

export async function refresh(oldRefreshToken: string) {
  const hashed = hashToken(oldRefreshToken);
  const existing = await refreshTokenRepository.findRefreshTokenByTokenHash(hashed);

  if (!existing || existing.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
  if (existing.revoked) {
    // An old token coming back means it was copied: end every session of that user. The grace
    // period covers two tabs refreshing with the same cookie at the same moment.
    if (existing.updatedAt.getTime() < Date.now() - REFRESH_REUSE_GRACE_MS) {
      await refreshTokenRepository.revokeAllForUser(existing.userId);
      logger.warn(
        { userId: existing.userId },
        'Refresh token reuse detected, all sessions revoked'
      );
    }
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const rotated = await refreshTokenRepository.revokeRefreshTokenIfActive(existing.id);
  if (!rotated) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const user = await userRepository.findById(existing.userId);
  if (!user) {
    throw new UnauthorizedError('User no longer exists');
  }

  const accessToken = signAccessToken({
    id: user.id,
    role: user.role,
    companyId: user.companyId,
  });
  const newRefreshToken = generateRefreshToken();

  await refreshTokenRepository.createRefreshToken({
    userId: user.id,
    token: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(oldRefreshToken: string) {
  const hashed = hashToken(oldRefreshToken);
  const existing = await refreshTokenRepository.findRefreshTokenByTokenHash(hashed);
  if (existing) {
    await refreshTokenRepository.revokeRefreshToken(existing.id);
  }
}

export async function requestPasswordReset(email: string) {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await userRepository.setPasswordResetToken(user.id, tokenHash, expiresAt);
  await sendEmailSafely(() => getContainer().email.sendPasswordResetEmail(user.email, rawToken));
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const tokenHash = hashToken(rawToken);
  const user = await userRepository.findByResetTokenHash(tokenHash);

  if (!user || !user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired reset token');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await userRepository.updatePassword(user.id, newPasswordHash);
  await userRepository.setPasswordResetToken(user.id, null, null);

  // Security measure: revoke ALL existing refresh tokens after a password reset
  await refreshTokenRepository.revokeAllForUser(user.id);
}
