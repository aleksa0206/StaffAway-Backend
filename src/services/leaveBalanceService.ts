import * as leaveBalanceRepository from "../repositories/leaveBalanceRepository";

export async function getAllLeaveBalances() {
  return await leaveBalanceRepository.findAllLeaveBalances();
}

export async function getLeaveBalanceById(leaveBalanceId: number) {
  return await leaveBalanceRepository.findLeaveBalanceById(leaveBalanceId);
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
  data: {
    userId?: number;
    leaveTypeId?: number;
    companyId?: number;
    year?: number;
    totalDays?: number;
    usedDays?: number;
  },
) {
  return await leaveBalanceRepository.updateLeaveBalance(leaveBalanceId, data);
}

export async function deleteLeaveBalance(leaveBalanceId: number) {
  return await leaveBalanceRepository.removeLeaveBalance(leaveBalanceId);
}