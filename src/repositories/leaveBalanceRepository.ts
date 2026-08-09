import { LeaveBalance } from "@prisma/client";
import { prisma } from "../config/prismaClient";

export async function findAllLeaveBalances(): Promise<LeaveBalance[]> {
  return await prisma.leaveBalance.findMany();
}

export async function findLeaveBalanceById(leaveBalanceId: number): Promise<LeaveBalance | null> {
  return await prisma.leaveBalance.findUnique({ where: { id: leaveBalanceId } });
}

export async function createLeaveBalance(data: {
  userId: number;
  leaveTypeId: number;
  companyId: number;
  year: number;
  totalDays: number;
  usedDays: number;
}): Promise<LeaveBalance> {
  return await prisma.leaveBalance.create({ data });
}

export async function updateLeaveBalance(
  leaveBalanceId: number,
  data: {
    userId?: number;
    leaveTypeId?: number;
    companyId?: number;
    year?: number;
    totalDays?: number;
    usedDays?: number;
  },
): Promise<LeaveBalance> {
  return await prisma.leaveBalance.update({ where: { id: leaveBalanceId }, data });
}

export async function removeLeaveBalance(leaveBalanceId: number): Promise<LeaveBalance> {
  return await prisma.leaveBalance.delete({ where: { id: leaveBalanceId } });
}