import * as leaveRequestRepository from "../repositories/leaveRequestRepository";

export async function getAllLeaveRequests() {
  return await leaveRequestRepository.findAllLeaveRequests();
}

export async function getLeaveRequestById(leaveRequestId: number) {
  return await leaveRequestRepository.findLeaveRequestById(leaveRequestId);
}

export async function createLeaveRequest(data: {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  status: "Pending" | "Approval" | "Rejected";
  comment?: string;
  userId: number;
  approvedById?: number;
  leaveTypeId: number;
  companyId: number;
}) {
  return await leaveRequestRepository.createLeaveRequest(data);
}

export async function updateLeaveRequest(
  leaveRequestId: number,
  data: {
    startDate?: Date;
    endDate?: Date;
    totalDays?: number;
    status?: "Pending" | "Approval" | "Rejected";
    comment?: string;
    approvedById?: number;
    leaveTypeId?: number;
    companyId?: number;
  },
) {
  return await leaveRequestRepository.updateLeaveRequest(leaveRequestId, data);
}

export async function deleteLeaveRequest(leaveRequestId: number) {
  return await leaveRequestRepository.removeLeaveRequest(leaveRequestId);
}