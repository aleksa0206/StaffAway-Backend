import * as leaveRequestRepository from '../repositories/leaveRequestRepository';
import { notFound, forbidden } from '../errors/AppError';

export async function getAllLeaveRequests(companyId: number) {
  return await leaveRequestRepository.findAllLeaveRequests(companyId);
}

export async function getLeaveRequestById(leaveRequestId: number, companyId: number) {
  const leaveRequest = await leaveRequestRepository.findLeaveRequestById(leaveRequestId);
  if (!leaveRequest) throw notFound('LeaveRequest');
  if (leaveRequest.companyId !== companyId) throw forbidden();
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
    status: 'Pending', // uvek Pending pri kreiranju, klijent ne bira status
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
  if (!leaveRequest) throw notFound('LeaveRequest');
  if (leaveRequest.companyId !== companyId) throw forbidden();

  return await leaveRequestRepository.updateLeaveRequest(leaveRequestId, data);
}

export async function deleteLeaveRequest(leaveRequestId: number, companyId: number) {
  const leaveRequest = await leaveRequestRepository.findLeaveRequestById(leaveRequestId);
  if (!leaveRequest) throw notFound('LeaveRequest');
  if (leaveRequest.companyId !== companyId) throw forbidden();

  return await leaveRequestRepository.removeLeaveRequest(leaveRequestId);
}