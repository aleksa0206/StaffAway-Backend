import * as leaveRequestRepository from '../repositories/leaveRequestRepository';
import * as leaveTypeRepository from '../repositories/leaveTypeRepository';
import * as leaveBalanceRepository from '../repositories/leaveBalanceRepository';
import * as statusHistoryRepository from '../repositories/statusHistoryRepository';
import * as companySettingsRepository from '../repositories/companySettingsRepository';
import * as notificationRepository from '../repositories/notificationRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { ConflictError } from '../errors/ConflictError';
import { ValidationError } from '../errors/ValidationError';
import { prisma } from '../config/prismaClient';
import { Prisma } from '@prisma/client';

type LeaveStatus = 'Pending' | 'Approval' | 'Rejected';
type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

async function assertNoOverlap(
  userId: number,
  startDate: Date,
  endDate: Date,
  excludeLeaveRequestId?: number,
  client: PrismaClientOrTx = prisma
) {
  const overlapping = await leaveRequestRepository.findOverlappingLeaveRequests(
    userId,
    startDate,
    endDate,
    excludeLeaveRequestId,
    client
  );

  if (overlapping.length > 0) {
    throw new ConflictError('Leave request overlaps with an existing request');
  }
}

function assertTotalDaysWithinRange(startDate: Date, endDate: Date, totalDays: number) {
  const daySpan = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (totalDays > daySpan) {
    throw new ValidationError(
      `totalDays (${totalDays}) cannot exceed the ${daySpan}-day span between startDate and endDate`
    );
  }
}

async function adjustLeaveBalanceOnStatusChange(
  client: Prisma.TransactionClient,
  userId: number,
  leaveTypeId: number,
  totalDays: number,
  year: number,
  oldStatus: LeaveStatus,
  newStatus: LeaveStatus
) {
  const leaveType = await leaveTypeRepository.findLeaveTypeById(leaveTypeId);
  if (!leaveType || !leaveType.countsTowardBalance) {
    return;
  }

  const wasApproved = oldStatus === 'Approval';
  const isApproved = newStatus === 'Approval';

  if (wasApproved === isApproved) {
    return;
  }

  const balance = await leaveBalanceRepository.findLeaveBalanceByUserTypeYear(
    userId,
    leaveTypeId,
    year,
    client
  );
  if (!balance) {
    throw new NotFoundError('LeaveBalance');
  }

  const delta = isApproved ? totalDays : -totalDays;

  await leaveBalanceRepository.incrementUsedDays(balance.id, delta, client);
}

export async function getAllLeaveRequests(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  return await leaveRequestRepository.findAllLeaveRequests(companyId, pagination);
}

export async function updateLeaveRequest(
  leaveRequestId: number,
  companyId: number,
  changedById: number,
  changedByRole: string,
  data: {
    startDate?: Date;
    endDate?: Date;
    totalDays?: number;
    status?: LeaveStatus;
    comment?: string;
    approvedById?: number;
  }
) {
  const leaveRequest = await leaveRequestRepository.findLeaveRequestById(leaveRequestId);
  if (!leaveRequest) throw new NotFoundError('LeaveRequest');
  if (leaveRequest.companyId !== companyId) throw new ForbiddenError();

  const isOwner = leaveRequest.userId === changedById;
  const isManagerOrHr = changedByRole === 'Manager' || changedByRole === 'Hr';
  if (!isOwner && !isManagerOrHr) {
    throw new ForbiddenError('You can only update your own leave requests');
  }

  const effectiveStartDate = data.startDate ?? leaveRequest.startDate;
  const effectiveEndDate = data.endDate ?? leaveRequest.endDate;
  const effectiveTotalDays = data.totalDays ?? leaveRequest.totalDays;

  assertTotalDaysWithinRange(effectiveStartDate, effectiveEndDate, effectiveTotalDays);

  const oldStatus = leaveRequest.status as LeaveStatus;
  const newStatus = data.status ?? oldStatus;
  const statusChanged = newStatus !== oldStatus;

  if (changedByRole === 'Employee' && (statusChanged || data.approvedById !== undefined)) {
    throw new ForbiddenError('Only Manager or Hr can approve or reject leave requests');
  }
  return await prisma.$transaction(async (tx) => {
    if (data.startDate || data.endDate) {
      await leaveRequestRepository.lockUserForLeaveRequestWrite(leaveRequest.userId, tx);
      await assertNoOverlap(
        leaveRequest.userId,
        effectiveStartDate,
        effectiveEndDate,
        leaveRequestId,
        tx
      );
    }

    if (statusChanged) {
      await adjustLeaveBalanceOnStatusChange(
        tx,
        leaveRequest.userId,
        leaveRequest.leaveTypeId,
        effectiveTotalDays,
        effectiveStartDate.getFullYear(),
        oldStatus,
        newStatus
      );

      await statusHistoryRepository.createStatusHistory(
        { leaveRequestId, changedById, companyId, oldStatus, newStatus },
        tx
      );

      if (newStatus === 'Approval' || newStatus === 'Rejected') {
        await notificationRepository.createNotification(
          {
            userId: leaveRequest.userId,
            message:
              newStatus === 'Approval'
                ? 'Your leave request has been approved.'
                : 'Your leave request has been rejected.',
            isRead: false,
            type: newStatus === 'Approval' ? 'LeaveRequestApproved' : 'LeaveRequestRejected',
          },
          tx
        );
      }
    }

    return await leaveRequestRepository.updateLeaveRequest(leaveRequestId, data, tx);
  });
}

export async function getLeaveRequestById(leaveRequestId: number, companyId: number) {
  const leaveRequest = await leaveRequestRepository.findLeaveRequestById(leaveRequestId);
  if (!leaveRequest) throw new NotFoundError('LeaveRequest');
  if (leaveRequest.companyId !== companyId) throw new ForbiddenError();
  return leaveRequest;
}

async function assertMinimumNotice(companyId: number, startDate: Date) {
  const settings = await companySettingsRepository.findCompanySettingsByCompanyId(companyId);
  const minDaysNotice = settings?.minDaysNoticeForLeave ?? 1;

  const now = new Date();
  const msUntilStart = startDate.getTime() - now.getTime();
  const daysUntilStart = msUntilStart / (1000 * 60 * 60 * 24);

  if (daysUntilStart < minDaysNotice) {
    throw new ConflictError(
      `Leave requests must be submitted at least ${minDaysNotice} day(s) in advance`
    );
  }
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
  await assertMinimumNotice(data.companyId, data.startDate);
  assertTotalDaysWithinRange(data.startDate, data.endDate, data.totalDays);

  return await prisma.$transaction(async (tx) => {
    await leaveRequestRepository.lockUserForLeaveRequestWrite(data.userId, tx);
    await assertNoOverlap(data.userId, data.startDate, data.endDate, undefined, tx);

    return await leaveRequestRepository.createLeaveRequest(
      {
        ...data,
        status: 'Pending',
      },
      tx
    );
  });
}

export async function deleteLeaveRequest(
  leaveRequestId: number,
  companyId: number,
  requestingUserId: number,
  requestingUserRole: string
) {
  const leaveRequest = await leaveRequestRepository.findLeaveRequestById(leaveRequestId);
  if (!leaveRequest) throw new NotFoundError('LeaveRequest');
  if (leaveRequest.companyId !== companyId) throw new ForbiddenError();

  const isOwner = leaveRequest.userId === requestingUserId;
  const isManagerOrHr = requestingUserRole === 'Manager' || requestingUserRole === 'Hr';
  if (!isOwner && !isManagerOrHr) {
    throw new ForbiddenError('You can only delete your own leave requests');
  }

  return await leaveRequestRepository.removeLeaveRequest(leaveRequestId);
}
