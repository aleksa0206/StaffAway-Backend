import * as leaveRequestRepository from '../repositories/leaveRequestRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

export async function getAllLeaveRequests(companyId: number) {
  return await leaveRequestRepository.findAllLeaveRequests(companyId);
}

export async function getLeaveRequestById(leaveRequestId: number, companyId: number) {
  const leaveRequest = await leaveRequestRepository.findLeaveRequestById(leaveRequestId);
  if (!leaveRequest) throw new NotFoundError('LeaveRequest');
  if (leaveRequest.companyId !== companyId) throw new ForbiddenError();
  return leaveRequest;
}

export async function createLeaveRequest(data: {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  comment?: string;
  userId: number;
  leaveTypeId: number;
  companyId: number;
}) {
  return await leaveRequestRepository.createLeaveRequest({
    ...data,
    status: 'Pending',
  });
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
  }
) {
  const leaveRequest = await leaveRequestRepository.findLeaveRequestById(leaveRequestId);
  if (!leaveRequest) throw new NotFoundError('LeaveRequest');
  if (leaveRequest.companyId !== companyId) throw new ForbiddenError();
  return await leaveRequestRepository.updateLeaveRequest(leaveRequestId, data);
}

export async function deleteLeaveRequest(leaveRequestId: number, companyId: number) {
  const leaveRequest = await leaveRequestRepository.findLeaveRequestById(leaveRequestId);
  if (!leaveRequest) throw new NotFoundError('LeaveRequest');
  if (leaveRequest.companyId !== companyId) throw new ForbiddenError();
  return await leaveRequestRepository.removeLeaveRequest(leaveRequestId);
}
