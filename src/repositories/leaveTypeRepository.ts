import { LeaveType } from '@prisma/client';
import { prisma } from '../config/prismaClient';

export async function findAllLeaveTypes(
    companyId: number,
): Promise<LeaveType[]> {
    return await prisma.leaveType.findMany({ where: { companyId } });
}

export async function findLeaveTypeById(
    leaveTypeId: number,
): Promise<LeaveType | null> {
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
    },
): Promise<LeaveType> {
    return await prisma.leaveType.update({ where: { id: leaveTypeId }, data });
}

export async function removeLeaveType(leaveTypeId: number): Promise<LeaveType> {
    return await prisma.leaveType.delete({ where: { id: leaveTypeId } });
}
