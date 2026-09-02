import * as leaveTypeRepository from '../repositories/leaveTypeRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

export async function getAllLeaveTypes(companyId: number) {
  return await leaveTypeRepository.findAllLeaveTypes(companyId);
}

export async function getLeaveTypeById(leaveTypeId: number, companyId: number) {
  const leaveType = await leaveTypeRepository.findLeaveTypeById(leaveTypeId);

  if (!leaveType) throw new NotFoundError('LeaveType');
  if (leaveType.companyId !== companyId) throw new ForbiddenError();

  return leaveType;
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
  companyId: number,
  data: {
    name?: string;
    requiresApproval?: boolean;
    countsTowardBalance?: boolean;
  }
) {
  const leaveType = await leaveTypeRepository.findLeaveTypeById(leaveTypeId);

  if (!leaveType) throw new NotFoundError('LeaveType');
  if (leaveType.companyId !== companyId) throw new ForbiddenError();

  return await leaveTypeRepository.updateLeaveType(leaveTypeId, data);
}

export async function deleteLeaveType(leaveTypeId: number, companyId: number) {
  const leaveType = await leaveTypeRepository.findLeaveTypeById(leaveTypeId);

  if (!leaveType) throw new NotFoundError('LeaveType');
  if (leaveType.companyId !== companyId) throw new ForbiddenError();

  return await leaveTypeRepository.removeLeaveType(leaveTypeId);
}