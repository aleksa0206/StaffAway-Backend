import * as leaveRequestRepository from '../repositories/leaveRequestRepository';

export async function getAllLeaveRequests(companyId: number) {
    return await leaveRequestRepository.findAllLeaveRequests(companyId);
}

export async function getLeaveRequestById(
    leaveRequestId: number,
    companyId: number,
) {
    const leaveRequest =
        await leaveRequestRepository.findLeaveRequestById(leaveRequestId);
    if (!leaveRequest || leaveRequest.companyId !== companyId) {
        return null;
    }
    return leaveRequest;
}

export async function createLeaveRequest(data: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
    status: 'Pending' | 'Approval' | 'Rejected';
    comment?: string;
    userId: number;
    leaveTypeId: number;
    companyId: number;
}) {
    return await leaveRequestRepository.createLeaveRequest(data);
}

export async function updateLeaveRequest(
    leaveRequestId: number,
    companyId: number,
    data: {
        startDate?: Date;
        endDate?: Date;
        totalDays?: number;
        status?: 'Pending' | 'Approval' | 'Rejected';
        comment?: string;
        approvedById?: number;
    },
) {
    const leaveRequest =
        await leaveRequestRepository.findLeaveRequestById(leaveRequestId);
    if (!leaveRequest) {
        throw new Error('Zahtev ne postoji');
    }
    if (leaveRequest.companyId !== companyId) {
        throw new Error('Nemate pravo pristupa ovom zahtevu');
    }
    return await leaveRequestRepository.updateLeaveRequest(
        leaveRequestId,
        data,
    );
}

export async function deleteLeaveRequest(
    leaveRequestId: number,
    companyId: number,
) {
    const leaveRequest =
        await leaveRequestRepository.findLeaveRequestById(leaveRequestId);
    if (!leaveRequest) {
        throw new Error('Zahtev ne postoji');
    }
    if (leaveRequest.companyId !== companyId) {
        throw new Error('Nemate pravo pristupa ovom zahtevu');
    }
    return await leaveRequestRepository.removeLeaveRequest(leaveRequestId);
}
