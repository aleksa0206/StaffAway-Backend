import { prisma } from "../config/prismaClient";
import type { LeaveBalance, Prisma } from "@prisma/client";

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export async function findLeaveBalanceById(
  leaveBalanceId: number,
): Promise<LeaveBalance | null> {
  return await prisma.leaveBalance.findUnique({
    where: { id: leaveBalanceId },
  });
}

export async function updateLeaveBalance(
  leaveBalanceId: number,
  data: { totalDays?: number; usedDays?: number },
  client: PrismaClientOrTx = prisma,
) {
  return await client.leaveBalance.update({
    where: { id: leaveBalanceId },
    data,
  });
}

export async function findAllLeaveBalances(
  companyId: number,
): Promise<LeaveBalance[]> {
  return await prisma.leaveBalance.findMany({ where: { companyId } });
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

export async function removeLeaveBalance(
  leaveBalanceId: number,
): Promise<LeaveBalance> {
  return await prisma.leaveBalance.delete({ where: { id: leaveBalanceId } });
}

export async function findLeaveBalanceByUserTypeYear(
  userId: number,
  leaveTypeId: number,
  year: number,
  client: PrismaClientOrTx = prisma,
) {
  return await client.leaveBalance.findUnique({
    where: { userId_leaveTypeId_year: { userId, leaveTypeId, year } },
  });
}
