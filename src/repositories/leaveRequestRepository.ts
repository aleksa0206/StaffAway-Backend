import { LeaveRequest, LeaveStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prismaClient';
import { compact } from '../utils/queryParams';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export const LEAVE_REQUEST_SORTS = ['-createdAt', 'startDate', '-startDate'] as const;
export type LeaveRequestSort = (typeof LEAVE_REQUEST_SORTS)[number];

const ORDER_BY: Record<LeaveRequestSort, Prisma.LeaveRequestOrderByWithRelationInput> = {
  '-createdAt': { createdAt: 'desc' },
  startDate: { startDate: 'asc' },
  '-startDate': { startDate: 'desc' },
};

const personSelect = { id: true, firstName: true, lastName: true } as const;

const leaveRequestInclude = {
  user: { select: personSelect },
  approvedBy: { select: personSelect },
  leaveType: { select: { id: true, name: true } },
} as const;

export type LeaveRequestFilters = {
  userId?: number | undefined;
  statuses?: LeaveStatus[] | undefined;
  managerId?: number | undefined;
  departmentId?: number | undefined;
  /** Requests overlapping [from, to]; either bound may be open. */
  from?: Date | undefined;
  to?: Date | undefined;
  sort?: LeaveRequestSort | undefined;
};

export async function findAllLeaveRequests(
  companyId: number,
  filters: LeaveRequestFilters,
  pagination: { skip: number; take: number }
) {
  const where = compact({
    companyId,
    userId: filters.userId,
    status: filters.statuses ? { in: filters.statuses } : undefined,
    user: compact({ managerId: filters.managerId, departmentId: filters.departmentId }),
    startDate: filters.to ? { lte: filters.to } : undefined,
    endDate: filters.from ? { gte: filters.from } : undefined,
  });
  const [data, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where,
      include: leaveRequestInclude,
      orderBy: [ORDER_BY[filters.sort ?? '-createdAt'], { id: 'asc' }],
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.leaveRequest.count({ where }),
  ]);
  return { data, total };
}

export async function findLeaveRequestById(leaveRequestId: number) {
  return await prisma.leaveRequest.findUnique({
    where: { id: leaveRequestId },
    include: leaveRequestInclude,
  });
}

export async function createLeaveRequest(
  data: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
    status: LeaveStatus;
    comment?: string;
    userId: number;
    leaveTypeId: number;
    companyId: number;
  },
  client: PrismaClientOrTx = prisma
) {
  return await client.leaveRequest.create({ data, include: leaveRequestInclude });
}

export async function updateLeaveRequest(
  leaveRequestId: number,
  data: {
    startDate?: Date;
    endDate?: Date;
    totalDays?: number;
    status?: LeaveStatus;
    comment?: string;
    approvedById?: number | null;
  },
  client: PrismaClientOrTx = prisma
) {
  return await client.leaveRequest.update({
    where: { id: leaveRequestId },
    data,
    include: leaveRequestInclude,
  });
}

export async function removeLeaveRequest(leaveRequestId: number): Promise<LeaveRequest> {
  return await prisma.leaveRequest.delete({ where: { id: leaveRequestId } });
}

export async function findOverlappingLeaveRequests(
  userId: number,
  startDate: Date,
  endDate: Date,
  excludeLeaveRequestId?: number,
  client: PrismaClientOrTx = prisma
): Promise<LeaveRequest[]> {
  return await client.leaveRequest.findMany({
    where: {
      userId,
      status: { notIn: ['Rejected', 'Cancelled'] },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
      ...(excludeLeaveRequestId ? { id: { not: excludeLeaveRequestId } } : {}),
    },
  });
}

export async function lockUserForLeaveRequestWrite(
  userId: number,
  client: Prisma.TransactionClient
): Promise<void> {
  await client.$queryRaw`SELECT id FROM User WHERE id = ${userId} FOR UPDATE`;
}
