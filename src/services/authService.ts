import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
import QRCode from 'qrcode';
import * as userRepository from '../repositories/userRepository';
import * as refreshTokenRepository from '../repositories/refreshTokenRepository';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { LockedError } from '../errors/LockedError';
import { TwoFactorRequiredError } from '../errors/TwoFactorRequiredError';
import { sendPasswordResetEmail } from './emailService';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const totp = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
  issuer: 'StaffAway',
});

// ... ostale konstante (REFRESH_TOKEN_TTL_MS, itd.) ostaju iste
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const TEMP_TOKEN_TTL = '5m';

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

function signAccessToken(user: { id: number; role: string; companyId: number }) {
  return jwt.sign(
    { userId: user.id, role: user.role, companyId: user.companyId },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' }
  );
}

function signTempToken(userId: number) {
  return jwt.sign({ userId, purpose: '2fa-pending' }, process.env.JWT_SECRET as string, {
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

export async function login(email: string, password: string) {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new LockedError('Account is temporarily locked due to too many failed login attempts');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    const attemptsAfterThis = user.failedLoginAttempts + 1;

    if (attemptsAfterThis >= MAX_FAILED_LOGIN_ATTEMPTS) {
      await userRepository.setAccountLock(user.id, new Date(Date.now() + LOCKOUT_DURATION_MS), 0);
      throw new LockedError(
        'Account locked due to too many failed login attempts. Try again in 15 minutes.'
      );
    }

    await userRepository.incrementFailedLoginAttempts(user.id);
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await userRepository.setAccountLock(user.id, null, 0);
  }

  if (user.twoFactorEnabled) {
    const tempToken = signTempToken(user.id);
    throw new TwoFactorRequiredError(tempToken);
  }

  const { accessToken, refreshToken } = await issueTokensForUser(user);
  const { passwordHash, twoFactorSecret, ...safeUser } = user;

  return { accessToken, refreshToken, user: safeUser };
}

export async function verifyTwoFactorLogin(tempToken: string, code: string) {
  let payload: { userId: number; purpose: string };

  try {
    payload = jwt.verify(tempToken, process.env.JWT_SECRET as string) as typeof payload;
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

  const result = await totp.verify(code, { secret: user.twoFactorSecret });
  if (!result.valid) {
    throw new UnauthorizedError('Invalid two-factor code');
  }

  const { accessToken, refreshToken } = await issueTokensForUser(user);
  const { passwordHash, twoFactorSecret, ...safeUser } = user;

  return { accessToken, refreshToken, user: safeUser };
}

export async function setupTwoFactor(userId: number) {
  const user = await userRepository.findByIdWithAuthFields(userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
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
export async function disableTwoFactor(userId: number) {
  await userRepository.disableTwoFactor(userId);
}

export async function refresh(oldRefreshToken: string) {
  const hashed = hashToken(oldRefreshToken);
  const existing = await refreshTokenRepository.findRefreshTokenByTokenHash(hashed);

  if (!existing || existing.revoked || existing.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  await refreshTokenRepository.revokeRefreshToken(existing.id);

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
  await sendPasswordResetEmail(user.email, rawToken);
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

  // Bezbednosna mera: poništi SVE postojece refresh tokene nakon reset-a lozinke
  await refreshTokenRepository.revokeAllForUser(user.id);
}
