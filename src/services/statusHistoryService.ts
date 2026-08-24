import * as statusHistoryRepository from '../repositories/statusHistoryRepository';

export async function getAllStatusHistories(companyId: number) {
    return await statusHistoryRepository.findAllStatusHistories(companyId);
}

export async function getStatusHistoryById(
    statusHistoryId: number,
    companyId: number,
) {
    const statusHistory =
        await statusHistoryRepository.findStatusHistoryById(statusHistoryId);
    if (!statusHistory || statusHistory.companyId !== companyId) {
        return null;
    }
    return statusHistory;
}

export async function createStatusHistory(data: {
    leaveRequestId: number;
    changedById: number;
    companyId: number;
    oldStatus: 'Pending' | 'Approval' | 'Rejected';
    newStatus: 'Pending' | 'Approval' | 'Rejected';
}) {
    return await statusHistoryRepository.createStatusHistory(data);
}
