import * as leaveTypeRepository from "../repositories/leaveTypeRepository";

export async function getAllLeaveTypes() {
  return await leaveTypeRepository.findAllLeaveTypes();
}

export async function getLeaveTypeById(leaveTypeId: number) {
  return await leaveTypeRepository.findLeaveTypeById(leaveTypeId);
}

export async function createLeaveType(data: {
  name: string;
  requiresApproval: boolean;
  countsTowardBalance: boolean;
  companyId: number;
}) {
  return await leaveTypeRepository.createLeaveType(data);
}

export async function updateLeaveType(
  leaveTypeId: number,
  data: {
    name?: string;
    requiresApproval?: boolean;
    countsTowardBalance?: boolean;
    companyId?: number;
  },
) {
  return await leaveTypeRepository.updateLeaveType(leaveTypeId, data);
}

export async function deleteLeaveType(leaveTypeId: number) {
  return await leaveTypeRepository.removeLeaveType(leaveTypeId);
}
