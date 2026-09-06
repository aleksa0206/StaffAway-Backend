import { Prisma, StatusHistory } from '@prisma/client';
import { prisma } from '../config/prismaClient';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export async function findAllStatusHistories(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  const [data, total] = await Promise.all([
    prisma.statusHistory.findMany({
      where: { companyId },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.statusHistory.count({ where: { companyId } }),
  ]);
  return { data, total };
}

export async function findStatusHistoryById(
  statusHistoryId: number
): Promise<StatusHistory | null> {
  return await prisma.statusHistory.findUnique({
    where: { id: statusHistoryId },
  });
}

export async function createStatusHistory(
  data: {
    leaveRequestId: number;
    changedById: number;
    companyId: number;
    oldStatus: 'Pending' | 'Approval' | 'Rejected';
    newStatus: 'Pending' | 'Approval' | 'Rejected';
  },
  client: PrismaClientOrTx = prisma
) {
  return await client.statusHistory.create({ data });
}
