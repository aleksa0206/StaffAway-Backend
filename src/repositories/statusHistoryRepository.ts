import { LeaveStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prismaClient';
import { compact } from '../utils/queryParams';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

const statusHistoryInclude = {
  changedBy: { select: { id: true, firstName: true, lastName: true } },
} as const;

export async function findAllStatusHistories(
  companyId: number,
  filters: { leaveRequestId?: number | undefined },
  pagination: { skip: number; take: number }
) {
  const where = compact({ companyId, leaveRequestId: filters.leaveRequestId });
  const [data, total] = await Promise.all([
    prisma.statusHistory.findMany({
      where,
      include: statusHistoryInclude,
      orderBy: { changedAt: 'asc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.statusHistory.count({ where }),
  ]);
  return { data, total };
}

export async function findStatusHistoryById(statusHistoryId: number) {
  return await prisma.statusHistory.findUnique({
    where: { id: statusHistoryId },
    include: statusHistoryInclude,
  });
}

export async function createStatusHistory(
  data: {
    leaveRequestId: number;
    changedById: number;
    companyId: number;
    oldStatus: LeaveStatus;
    newStatus: LeaveStatus;
  },
  client: PrismaClientOrTx = prisma
) {
  return await client.statusHistory.create({ data });
}
