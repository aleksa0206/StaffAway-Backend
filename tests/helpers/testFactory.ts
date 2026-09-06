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

export async function createTestLeaveType(
  companyId: number,
  overrides: Partial<{
    name: string;
    requiresApproval: boolean;
    countsTowardBalance: boolean;
  }> = {}
) {
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

export async function createTestDepartment(companyId: number, name = 'Engineering') {
  return await prisma.department.create({ data: { name, companyId } });
}

export async function createTestHoliday(
  companyId: number,
  overrides: Partial<{ name: string; date: Date; isRecurring: boolean }> = {}
) {
  return await prisma.holiday.create({
    data: {
      name: overrides.name ?? 'New Year',
      date: overrides.date ?? new Date('2027-01-01'),
      isRecurring: overrides.isRecurring ?? true,
      companyId,
    },
  });
}

export async function createTestWorkSchedule(params: {
  userId: number;
  companyId: number;
  hoursPerWeek?: number;
  isPartTime?: boolean;
}) {
  return await prisma.workSchedule.create({
    data: {
      userId: params.userId,
      companyId: params.companyId,
      hoursPerWeek: params.hoursPerWeek ?? 40,
      isPartTime: params.isPartTime ?? false,
    },
  });
}

export async function createTestApiKey(
  companyId: number,
  overrides: Partial<{ key: string; name: string }> = {}
) {
  return await prisma.apiKey.create({
    data: {
      key: overrides.key ?? `key-${Date.now()}-${Math.random()}`,
      name: overrides.name ?? 'Test Key',
      companyId,
    },
  });
}

export async function createRawLeaveRequest(params: {
  userId: number;
  leaveTypeId: number;
  companyId: number;
  startDate?: Date;
  endDate?: Date;
  totalDays?: number;
  status?: 'Pending' | 'Approval' | 'Rejected';
}) {
  return await prisma.leaveRequest.create({
    data: {
      userId: params.userId,
      leaveTypeId: params.leaveTypeId,
      companyId: params.companyId,
      startDate: params.startDate ?? new Date('2027-05-01'),
      endDate: params.endDate ?? new Date('2027-05-05'),
      totalDays: params.totalDays ?? 5,
      status: params.status ?? 'Pending',
    },
  });
}

export async function createTestAttachment(
  leaveRequestId: number,
  overrides: Partial<{ fileName: string; filePath: string }> = {}
) {
  return await prisma.attachment.create({
    data: {
      leaveRequestId,
      fileName: overrides.fileName ?? 'file.pdf',
      filePath: overrides.filePath ?? '/uploads/file.pdf',
    },
  });
}

export async function createTestComment(params: {
  leaveRequestId: number;
  authorId: number;
  companyId: number;
  text?: string;
}) {
  return await prisma.comment.create({
    data: {
      leaveRequestId: params.leaveRequestId,
      authorId: params.authorId,
      companyId: params.companyId,
      text: params.text ?? 'Test comment',
    },
  });
}

export async function createTestNotification(params: {
  userId: number;
  message?: string;
  isRead?: boolean;
  type?: 'LeaveRequestSubmitted' | 'LeaveRequestApproved' | 'LeaveRequestRejected' | 'General';
}) {
  return await prisma.notification.create({
    data: {
      userId: params.userId,
      message: params.message ?? 'Test notification',
      isRead: params.isRead ?? false,
      type: params.type ?? 'General',
    },
  });
}

export async function createTestRefreshToken(params: {
  userId: number;
  token?: string;
  expiresAt?: Date;
  revoked?: boolean;
}) {
  return await prisma.refreshToken.create({
    data: {
      userId: params.userId,
      token: params.token ?? `token-${Date.now()}-${Math.random()}`,
      expiresAt: params.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: params.revoked ?? false,
    },
  });
}

export async function createTestStatusHistory(params: {
  leaveRequestId: number;
  changedById: number;
  companyId: number;
  oldStatus?: 'Pending' | 'Approval' | 'Rejected';
  newStatus?: 'Pending' | 'Approval' | 'Rejected';
}) {
  return await prisma.statusHistory.create({
    data: {
      leaveRequestId: params.leaveRequestId,
      changedById: params.changedById,
      companyId: params.companyId,
      oldStatus: params.oldStatus ?? 'Pending',
      newStatus: params.newStatus ?? 'Approval',
    },
  });
}
