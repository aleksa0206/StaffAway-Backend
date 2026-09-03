import bcrypt from "bcrypt";
import * as userRepository from "../repositories/userRepository";
import * as leaveTypeRepository from "../repositories/leaveTypeRepository";
import * as leaveBalanceRepository from "../repositories/leaveBalanceRepository";
import * as companySettingsRepository from "../repositories/companySettingsRepository";
import * as auditLogRepository from '../repositories/auditLogRepository';
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";

export async function getAllUsers(companyId: number) {
  return await userRepository.findAll(companyId);
}

export async function getUserById(userId: number, companyId: number) {
  const user = await userRepository.findById(userId);
  if (!user) throw new NotFoundError("User");
  if (user.companyId !== companyId) throw new ForbiddenError();
  return user;
}
export async function createUser(
  input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "Employee" | "Manager" | "Hr";
    managerId: number | null;
    hireDate: Date;
  },
  requestingUser: { companyId: number; role: string },
) {
  if (requestingUser.role !== "Hr") {
    throw new ForbiddenError("Only Hr can create new users");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const newUser = await userRepository.create({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    passwordHash,
    role: input.role,
    managerId: input.managerId,
    hireDate: input.hireDate,
    companyId: requestingUser.companyId,
  });

  await initializeLeaveBalancesForUser(newUser.id, requestingUser.companyId);

  return newUser;
}

async function initializeLeaveBalancesForUser(
  userId: number,
  companyId: number,
) {
  const [leaveTypes, settings] = await Promise.all([
    leaveTypeRepository.findAllLeaveTypes(companyId),
    companySettingsRepository.findCompanySettingsByCompanyId(companyId),
  ]);

  const defaultDays = settings?.defaultAnnualLeaveDays ?? 20;
  const currentYear = new Date().getFullYear();

  const eligibleTypes = leaveTypes.filter((lt) => lt.countsTowardBalance);

  await Promise.all(
    eligibleTypes.map((leaveType) =>
      leaveBalanceRepository.createLeaveBalance({
        userId,
        leaveTypeId: leaveType.id,
        year: currentYear,
        totalDays: defaultDays,
        usedDays: 0,
        companyId,
      }),
    ),
  );
}
export async function updateUser(
  targetUserId: number,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: 'Employee' | 'Manager' | 'Hr';
    managerId?: number | null;
    departmentId?: number | null;
    hireDate?: Date;
  },
  requestingUser: { userId: number; companyId: number; role: string }
) {
  const existing = await userRepository.findById(targetUserId);
  if (!existing) throw new NotFoundError('User');
  if (existing.companyId !== requestingUser.companyId) throw new ForbiddenError();

  const isSelf = requestingUser.userId === targetUserId;
  const isHr = requestingUser.role === 'Hr';

  if (!isSelf && !isHr) {
    throw new ForbiddenError('You can only update your own profile');
  }
  if (!isHr && data.role !== undefined) {
    throw new ForbiddenError('Only Hr can change roles');
  }

  const updated = await userRepository.update(targetUserId, data);

  if (data.role !== undefined && data.role !== existing.role) {
    await auditLogRepository.createAuditLog({
      performedById: requestingUser.userId,
      entityId: targetUserId,
      entityType: 'User',
      action: 'ROLE_CHANGE',
      oldValue: existing.role,
      newValue: data.role,
      companyId: requestingUser.companyId,
    });
  }

  return updated;
}
export async function deleteUser(
  targetUserId: number,
  requestingUser: { userId: number; companyId: number; role: string }
) {
  if (requestingUser.role !== 'Hr') {
    throw new ForbiddenError('Only Hr can delete users');
  }
  if (requestingUser.userId === targetUserId) {
    throw new ForbiddenError('You cannot delete your own account');
  }

  const existing = await userRepository.findById(targetUserId);
  if (!existing) throw new NotFoundError('User');
  if (existing.companyId !== requestingUser.companyId) throw new ForbiddenError();

  const deleted = await userRepository.remove(targetUserId);

  await auditLogRepository.createAuditLog({
    performedById: requestingUser.userId,
    entityId: targetUserId,
    entityType: 'User',
    action: 'DELETE_USER',
    oldValue: `${existing.firstName} ${existing.lastName} (${existing.email})`,
    companyId: requestingUser.companyId,
  });

  return deleted;
}