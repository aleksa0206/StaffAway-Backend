import { LeaveRequest } from '@prisma/client';
import { prisma } from '../config/prismaClient';

export async function findAllLeaveRequests(
    companyId: number,
): Promise<LeaveRequest[]> {
    return await prisma.leaveRequest.findMany({ where: { companyId } });
}

export async function findLeaveRequestById(
    leaveRequestId: number,
): Promise<LeaveRequest | null> {
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
): Promise<LeaveRequest> {
    return await prisma.leaveRequest.update({
        where: { id: leaveRequestId },
        data,
    });
}

export async function removeLeaveRequest(
    leaveRequestId: number,
): Promise<LeaveRequest> {
    return await prisma.leaveRequest.delete({ where: { id: leaveRequestId } });
}
