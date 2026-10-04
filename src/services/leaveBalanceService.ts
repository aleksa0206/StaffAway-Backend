import * as leaveBalanceRepository from '../repositories/leaveBalanceRepository';
import * as userRepository from '../repositories/userRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

export async function getAllLeaveBalances(
  companyId: number,
  filters: { userIds?: number[] | undefined; year?: number | undefined },
  pagination: { skip: number; take: number }
) {
  return await leaveBalanceRepository.findAllLeaveBalances(companyId, filters, pagination);
}

export async function getLeaveBalanceById(leaveBalanceId: number, companyId: number) {
  const leaveBalance = await leaveBalanceRepository.findLeaveBalanceById(leaveBalanceId);
  if (!leaveBalance) {
    throw new NotFoundError('LeaveBalance');
  }
  if (leaveBalance.companyId !== companyId) {
    throw new ForbiddenError();
  }
  return leaveBalance;
}

export async function createLeaveBalance(data: {
  userId: number;
  leaveTypeId: number;
  companyId: number;
  year: number;
  totalDays: number;
  usedDays: number;
}) {
  const user = await userRepository.findById(data.userId);
  if (!user || user.companyId !== data.companyId) {
    throw new ForbiddenError('User must belong to the same company');
  }

  return await leaveBalanceRepository.createLeaveBalance(data);
}

export async function updateLeaveBalance(
  leaveBalanceId: number,
  companyId: number,
  data: { totalDays?: number; usedDays?: number }
) {
  const leaveBalance = await leaveBalanceRepository.findLeaveBalanceById(leaveBalanceId);
  if (!leaveBalance) {
    throw new NotFoundError('LeaveBalance');
  }
  if (leaveBalance.companyId !== companyId) {
    throw new ForbiddenError();
  }
  return await leaveBalanceRepository.updateLeaveBalance(leaveBalanceId, data);
}

export async function deleteLeaveBalance(leaveBalanceId: number, companyId: number) {
  const leaveBalance = await leaveBalanceRepository.findLeaveBalanceById(leaveBalanceId);
  if (!leaveBalance) {
    throw new NotFoundError('LeaveBalance');
  }
  if (leaveBalance.companyId !== companyId) {
    throw new ForbiddenError();
  }
  return await leaveBalanceRepository.removeLeaveBalance(leaveBalanceId);
}
