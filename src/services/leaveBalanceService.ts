import * as leaveBalanceRepository from '../repositories/leaveBalanceRepository';
import { notFound, forbidden } from '../errors/AppError';

export async function getAllLeaveBalances(companyId: number) {
  return await leaveBalanceRepository.findAllLeaveBalances(companyId);
}

export async function getLeaveBalanceById(leaveBalanceId: number, companyId: number) {
  const leaveBalance = await leaveBalanceRepository.findLeaveBalanceById(leaveBalanceId);
  if (!leaveBalance) throw notFound('LeaveBalance');
  if (leaveBalance.companyId !== companyId) throw forbidden();
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
  return await leaveBalanceRepository.createLeaveBalance(data);
}

export async function updateLeaveBalance(
  leaveBalanceId: number,
  companyId: number,
  data: { totalDays?: number; usedDays?: number }
) {
  const leaveBalance = await leaveBalanceRepository.findLeaveBalanceById(leaveBalanceId);
  if (!leaveBalance) throw notFound('LeaveBalance');
  if (leaveBalance.companyId !== companyId) throw forbidden();

  return await leaveBalanceRepository.updateLeaveBalance(leaveBalanceId, data);
}

export async function deleteLeaveBalance(leaveBalanceId: number, companyId: number) {
  const leaveBalance = await leaveBalanceRepository.findLeaveBalanceById(leaveBalanceId);
  if (!leaveBalance) throw notFound('LeaveBalance');
  if (leaveBalance.companyId !== companyId) throw forbidden();

  return await leaveBalanceRepository.removeLeaveBalance(leaveBalanceId);
}