import { LeaveType } from '@prisma/client';
import { prisma } from '../config/prismaClient';

export async function findAllLeaveTypes(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  const [data, total] = await Promise.all([
    prisma.leaveType.findMany({
      where: { companyId },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.leaveType.count({ where: { companyId } }),
  ]);
  return { data, total };
}

export async function findLeaveTypeById(leaveTypeId: number): Promise<LeaveType | null> {
  return await prisma.leaveType.findUnique({ where: { id: leaveTypeId } });
}

export async function createLeaveType(data: {
  name: string;
  requiresApproval: boolean;
  countsTowardBalance: boolean;
  companyId: number;
}): Promise<LeaveType> {
  return await prisma.leaveType.create({ data });
}

export async function updateLeaveType(
  leaveTypeId: number,
  data: {
    name?: string;
    requiresApproval?: boolean;
    countsTowardBalance?: boolean;
    companyId?: number;
  }
): Promise<LeaveType> {
  return await prisma.leaveType.update({ where: { id: leaveTypeId }, data });
}

export async function removeLeaveType(leaveTypeId: number): Promise<LeaveType> {
  return await prisma.leaveType.delete({ where: { id: leaveTypeId } });
}
