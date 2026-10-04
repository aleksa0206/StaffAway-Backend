import bcrypt from 'bcrypt';
import * as userRepository from '../repositories/userRepository';
import * as leaveTypeRepository from '../repositories/leaveTypeRepository';
import * as leaveBalanceRepository from '../repositories/leaveBalanceRepository';
import * as companySettingsRepository from '../repositories/companySettingsRepository';
import * as auditLogRepository from '../repositories/auditLogRepository';
import * as departmentRepository from '../repositories/departmentRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { prisma } from '../config/prismaClient';
import { Prisma } from '@prisma/client';

export async function getAllUsers(
  companyId: number,
  filters: userRepository.UserFilters,
  pagination: { skip: number; take: number }
) {
  return await userRepository.findAll(companyId, filters, pagination);
}

export async function getUserById(userId: number, companyId: number) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User');
  }
  if (user.companyId !== companyId) {
    throw new ForbiddenError();
  }
  return user;
}

async function assertManagerInSameCompany(managerId: number | null | undefined, companyId: number) {
  if (managerId === null || managerId === undefined) {
    return;
  }
  const manager = await userRepository.findById(managerId);
  if (!manager || manager.companyId !== companyId) {
    throw new ForbiddenError('Manager must belong to the same company');
  }
}

async function assertDepartmentInSameCompany(
  departmentId: number | null | undefined,
  companyId: number
) {
  if (departmentId === null || departmentId === undefined) {
    return;
  }
  const department = await departmentRepository.findDepartmentById(departmentId);
  if (!department || department.companyId !== companyId) {
    throw new ForbiddenError('Department must belong to the same company');
  }
}
export async function createUser(
  input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'Employee' | 'Manager' | 'Hr';
    managerId: number | null;
    hireDate: Date;
  },
  requestingUser: { companyId: number; role: string }
) {
  if (requestingUser.role !== 'Hr') {
    throw new ForbiddenError('Only Hr can create new users');
  }

  await assertManagerInSameCompany(input.managerId, requestingUser.companyId);

  const passwordHash = await bcrypt.hash(input.password, 10);

  return await prisma.$transaction(async (tx) => {
    const newUser = await userRepository.create(
      {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        passwordHash,
        role: input.role,
        managerId: input.managerId,
        hireDate: input.hireDate,
        companyId: requestingUser.companyId,
      },
      tx
    );

    await initializeLeaveBalancesForUser(newUser.id, requestingUser.companyId, tx);

    return newUser;
  });
}

async function initializeLeaveBalancesForUser(
  userId: number,
  companyId: number,
  tx: Prisma.TransactionClient
) {
  const [leaveTypesResult, settings] = await Promise.all([
    leaveTypeRepository.findAllLeaveTypes(companyId, { skip: 0, take: 1000 }),
    companySettingsRepository.findCompanySettingsByCompanyId(companyId),
  ]);

  const leaveTypes = leaveTypesResult.data;

  const defaultDays = settings?.defaultAnnualLeaveDays ?? 20;
  const currentYear = new Date().getFullYear();
  const eligibleTypes = leaveTypes.filter((lt) => lt.countsTowardBalance);

  for (const leaveType of eligibleTypes) {
    await leaveBalanceRepository.createLeaveBalance(
      {
        userId,
        leaveTypeId: leaveType.id,
        year: currentYear,
        totalDays: defaultDays,
        usedDays: 0,
        companyId,
      },
      tx
    );
  }
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
  if (!existing) {
    throw new NotFoundError('User');
  }
  if (existing.companyId !== requestingUser.companyId) {
    throw new ForbiddenError();
  }

  const isSelf = requestingUser.userId === targetUserId;
  const isHr = requestingUser.role === 'Hr';

  if (!isSelf && !isHr) {
    throw new ForbiddenError('You can only update your own profile');
  }
  if (!isHr && data.role !== undefined) {
    throw new ForbiddenError('Only Hr can change roles');
  }

  await assertManagerInSameCompany(data.managerId, requestingUser.companyId);
  await assertDepartmentInSameCompany(data.departmentId, requestingUser.companyId);

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
  if (!existing) {
    throw new NotFoundError('User');
  }
  if (existing.companyId !== requestingUser.companyId) {
    throw new ForbiddenError();
  }

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
