import { LeaveRequest, Prisma } from '@prisma/client';
import { prisma } from '../config/prismaClient';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export async function findAllLeaveRequests(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  const [data, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: { companyId },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.leaveRequest.count({ where: { companyId } }),
  ]);
  return { data, total };
}

export async function findLeaveRequestById(leaveRequestId: number): Promise<LeaveRequest | null> {
  return await prisma.leaveRequest.findUnique({
    where: { id: leaveRequestId },
  });
}

export async function createLeaveRequest(data: {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  status: 'Pending' | 'Approval' | 'Rejected';
  comment?: string;
  userId: number;
  approvedById?: number;
  leaveTypeId: number;
  companyId: number;
}): Promise<LeaveRequest> {
  return await prisma.leaveRequest.create({ data });
}

export async function updateLeaveRequest(
  leaveRequestId: number,
  data: {
    startDate?: Date;
    endDate?: Date;
    totalDays?: number;
    status?: 'Pending' | 'Approval' | 'Rejected';
    comment?: string;
    approvedById?: number;
    leaveTypeId?: number;
    companyId?: number;
  },
  client: PrismaClientOrTx = prisma
): Promise<LeaveRequest> {
  return await client.leaveRequest.update({ where: { id: leaveRequestId }, data });
}

export async function removeLeaveRequest(leaveRequestId: number): Promise<LeaveRequest> {
  return await prisma.leaveRequest.delete({ where: { id: leaveRequestId } });
}

export async function findOverlappingLeaveRequests(
  userId: number,
  startDate: Date,
  endDate: Date,
  excludeLeaveRequestId?: number
): Promise<LeaveRequest[]> {
  return await prisma.leaveRequest.findMany({
    where: {
      userId,
      status: { not: 'Rejected' },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
      ...(excludeLeaveRequestId ? { id: { not: excludeLeaveRequestId } } : {}),
    },
  });
}
