import * as leaveBalanceRepository from '../repositories/leaveBalanceRepository';
import * as userRepository from '../repositories/userRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { visibleUserIdsFor } from './userService';

// Employees see their own balances, managers also their direct reports', Hr everyone's.
type Viewer = { userId: number; role: string };

export async function getAllLeaveBalances(
  viewer: Viewer,
  companyId: number,
  filters: { userIds?: number[] | undefined; year?: number | undefined },
  pagination: { skip: number; take: number }
) {
  const visibleUserIds = await visibleUserIdsFor(viewer);
  const userIds = visibleUserIds
    ? (filters.userIds ?? visibleUserIds).filter((id) => visibleUserIds.includes(id))
    : filters.userIds;
  return await leaveBalanceRepository.findAllLeaveBalances(
    companyId,
    { ...filters, userIds },
    pagination
  );
}

export async function getLeaveBalanceById(
  leaveBalanceId: number,
  companyId: number,
  viewer: Viewer
) {
  const leaveBalance = await leaveBalanceRepository.findLeaveBalanceById(leaveBalanceId);
  if (!leaveBalance) {
    throw new NotFoundError('LeaveBalance');
  }
  if (leaveBalance.companyId !== companyId) {
    throw new ForbiddenError();
  }
  const visibleUserIds = await visibleUserIdsFor(viewer);
  if (visibleUserIds && !visibleUserIds.includes(leaveBalance.userId)) {
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
