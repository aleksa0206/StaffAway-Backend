import bcrypt from 'bcrypt';
import { prisma } from '../../src/config/prismaClient';

export async function createTestCompany(name = 'Test Company') {
  return await prisma.company.create({ data: { name } });
}

export async function createTestUser(params: {
  companyId: number;
  email?: string;
  password?: string;
  role?: 'Employee' | 'Manager' | 'Hr';
}) {
  const password = params.password ?? 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: 'Test',
      lastName: 'User',
      email: params.email ?? `user${Date.now()}${Math.random()}@test.com`,
      passwordHash,
      role: params.role ?? 'Employee',
      hireDate: new Date('2024-01-01'),
      companyId: params.companyId,
    },
  });

  return { user, rawPassword: password };
}

export async function createTestLeaveType(companyId: number, overrides: Partial<{
  name: string;
  requiresApproval: boolean;
  countsTowardBalance: boolean;
}> = {}) {
  return await prisma.leaveType.create({
    data: {
      name: overrides.name ?? 'Annual Leave',
      requiresApproval: overrides.requiresApproval ?? true,
      countsTowardBalance: overrides.countsTowardBalance ?? true,
      companyId,
    },
  });
}

export async function createTestLeaveBalance(params: {
  userId: number;
  leaveTypeId: number;
  companyId: number;
  year?: number;
  totalDays?: number;
  usedDays?: number;
}) {
  return await prisma.leaveBalance.create({
    data: {
      userId: params.userId,
      leaveTypeId: params.leaveTypeId,
      companyId: params.companyId,
      year: params.year ?? new Date().getFullYear(),
      totalDays: params.totalDays ?? 20,
      usedDays: params.usedDays ?? 0,
    },
  });
}

export async function createTestCompanySettings(companyId: number, minDaysNoticeForLeave = 1) {
  return await prisma.companySettings.create({
    data: {
      companyId,
      companyName: 'Test Company',
      minDaysNoticeForLeave,
    },
  });
}
