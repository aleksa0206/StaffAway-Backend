import { prisma } from '../config/prismaClient';
import type { LeaveBalance, Prisma } from '@prisma/client';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export async function findLeaveBalanceById(leaveBalanceId: number): Promise<LeaveBalance | null> {
  return await prisma.leaveBalance.findUnique({
    where: { id: leaveBalanceId },
  });
}

export async function updateLeaveBalance(
  leaveBalanceId: number,
  data: { totalDays?: number; usedDays?: number },
  client: PrismaClientOrTx = prisma
) {
  return await client.leaveBalance.update({
    where: { id: leaveBalanceId },
    data,
  });
}

export async function findAllLeaveBalances(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  const [data, total] = await Promise.all([
    prisma.leaveBalance.findMany({
      where: { companyId },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.leaveBalance.count({ where: { companyId } }),
  ]);
  return { data, total };
}

export async function createLeaveBalance(
  data: {
    userId: number;
    leaveTypeId: number;
    companyId: number;
    year: number;
    totalDays: number;
    usedDays: number;
  },
  client: PrismaClientOrTx = prisma
) {
  return await client.leaveBalance.create({ data });
}

export async function incrementUsedDays(
  leaveBalanceId: number,
  delta: number,
  client: PrismaClientOrTx = prisma
): Promise<void> {
  await client.$executeRaw`UPDATE LeaveBalance SET usedDays = GREATEST(0, usedDays + ${delta}) WHERE id = ${leaveBalanceId}`;
}

export async function removeLeaveBalance(leaveBalanceId: number): Promise<LeaveBalance> {
  return await prisma.leaveBalance.delete({ where: { id: leaveBalanceId } });
}

export async function findLeaveBalanceByUserTypeYear(
  userId: number,
  leaveTypeId: number,
  year: number,
  client: PrismaClientOrTx = prisma
) {
  return await client.leaveBalance.findUnique({
    where: { userId_leaveTypeId_year: { userId, leaveTypeId, year } },
  });
}
