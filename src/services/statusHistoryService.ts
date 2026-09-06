import * as statusHistoryRepository from '../repositories/statusHistoryRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

export async function getAllStatusHistories(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  return await statusHistoryRepository.findAllStatusHistories(companyId, pagination);
}

export async function getStatusHistoryById(statusHistoryId: number, companyId: number) {
  const statusHistory = await statusHistoryRepository.findStatusHistoryById(statusHistoryId);

  if (!statusHistory) throw new NotFoundError('StatusHistory');
  if (statusHistory.companyId !== companyId) throw new ForbiddenError();

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
