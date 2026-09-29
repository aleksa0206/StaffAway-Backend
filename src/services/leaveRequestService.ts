import * as leaveRequestRepository from '../repositories/leaveRequestRepository';
import * as leaveTypeRepository from '../repositories/leaveTypeRepository';
import * as leaveBalanceRepository from '../repositories/leaveBalanceRepository';
import * as statusHistoryRepository from '../repositories/statusHistoryRepository';
import * as companySettingsRepository from '../repositories/companySettingsRepository';
import * as notificationRepository from '../repositories/notificationRepository';
import * as userRepository from '../repositories/userRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { ConflictError } from '../errors/ConflictError';
import { ValidationError } from '../errors/ValidationError';
import { prisma } from '../config/prismaClient';
import { LeaveStatus, Prisma } from '@prisma/client';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;
type RequestingUser = { userId: number; role: string };

function isManagerOrHr(role: string) {
  return role === 'Manager' || role === 'Hr';
}

// Everyone in the company can see who is away and when (the team calendar depends on it),
// but the requester's note is only for the requester, managers and Hr.
function redactForViewer<T extends { userId: number; comment: string | null }>(
  leaveRequest: T,
  viewer: RequestingUser
): T {
  if (isManagerOrHr(viewer.role) || leaveRequest.userId === viewer.userId) {
    return leaveRequest;
  }
  return { ...leaveRequest, comment: null };
}

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
  filters: leaveRequestRepository.LeaveRequestFilters,
  pagination: { skip: number; take: number },
  viewer: RequestingUser
) {
  const { data, total } = await leaveRequestRepository.findAllLeaveRequests(
    companyId,
    filters,
    pagination
  );
  return { data: data.map((request) => redactForViewer(request, viewer)), total };
}

async function assertCanDecide(
  leaveRequest: { userId: number },
  deciderId: number,
  deciderRole: string
) {
  if (deciderRole === 'Employee') {
    throw new ForbiddenError('Only Manager or Hr can approve or reject leave requests');
  }
  if (leaveRequest.userId === deciderId) {
    throw new ForbiddenError('You cannot decide on your own leave request');
  }
  if (deciderRole === 'Manager') {
    const requester = await userRepository.findById(leaveRequest.userId);
    if (requester?.managerId !== deciderId) {
      throw new ForbiddenError(
        'Managers can only decide on leave requests of their direct reports'
      );
    }
  }
}

function assertCanCancel(
  leaveRequest: { userId: number; status: LeaveStatus; startDate: Date },
  requestingUserId: number
) {
  if (leaveRequest.userId !== requestingUserId) {
    throw new ForbiddenError('You can only cancel your own leave requests');
  }
  if (leaveRequest.status !== 'Pending' && leaveRequest.status !== 'Approval') {
    throw new ConflictError('Only pending or approved leave requests can be cancelled');
  }
  if (leaveRequest.startDate <= new Date()) {
    throw new ConflictError('Leave that has already started cannot be cancelled');
  }
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
  }
) {
  const leaveRequest = await leaveRequestRepository.findLeaveRequestById(leaveRequestId);
  if (!leaveRequest) throw new NotFoundError('LeaveRequest');
  if (leaveRequest.companyId !== companyId) throw new ForbiddenError();

  const isOwner = leaveRequest.userId === changedById;
  if (!isOwner && !isManagerOrHr(changedByRole)) {
    throw new ForbiddenError('You can only update your own leave requests');
  }

  const editsDetails =
    data.startDate !== undefined ||
    data.endDate !== undefined ||
    data.totalDays !== undefined ||
    data.comment !== undefined;
  // Editing an approved request would not correct usedDays; an approved request is cancelled via a status change instead.
  if (editsDetails && leaveRequest.status !== 'Pending') {
    throw new ConflictError('Only pending leave requests can be edited');
  }

  const effectiveStartDate = data.startDate ?? leaveRequest.startDate;
  const effectiveEndDate = data.endDate ?? leaveRequest.endDate;
  const effectiveTotalDays = data.totalDays ?? leaveRequest.totalDays;

  assertTotalDaysWithinRange(effectiveStartDate, effectiveEndDate, effectiveTotalDays);

  const oldStatus = leaveRequest.status;
  const newStatus = data.status ?? oldStatus;
  const statusChanged = newStatus !== oldStatus;

  if (statusChanged) {
    if (oldStatus === 'Cancelled') {
      throw new ConflictError('Cancelled leave requests cannot be changed');
    }
    if (newStatus === 'Cancelled') {
      assertCanCancel(leaveRequest, changedById);
    } else {
      await assertCanDecide(leaveRequest, changedById, changedByRole);
    }
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
        effectiveStartDate.getUTCFullYear(),
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

    // The decider is recorded on approve/reject; a cancellation keeps who decided before.
    const decision =
      newStatus === 'Approval' || newStatus === 'Rejected'
        ? { approvedById: changedById }
        : newStatus === 'Pending'
          ? { approvedById: null }
          : {};

    return await leaveRequestRepository.updateLeaveRequest(
      leaveRequestId,
      statusChanged ? { ...data, ...decision } : data,
      tx
    );
  });
}

export async function getLeaveRequestById(
  leaveRequestId: number,
  companyId: number,
  viewer: RequestingUser
) {
  const leaveRequest = await leaveRequestRepository.findLeaveRequestById(leaveRequestId);
  if (!leaveRequest) throw new NotFoundError('LeaveRequest');
  if (leaveRequest.companyId !== companyId) throw new ForbiddenError();
  return redactForViewer(leaveRequest, viewer);
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
  const leaveType = await leaveTypeRepository.findLeaveTypeById(data.leaveTypeId);
  if (!leaveType || leaveType.companyId !== data.companyId) {
    throw new NotFoundError('LeaveType');
  }

  await assertMinimumNotice(data.companyId, data.startDate);
  assertTotalDaysWithinRange(data.startDate, data.endDate, data.totalDays);

  const requester = await userRepository.findById(data.userId);

  return await prisma.$transaction(async (tx) => {
    await leaveRequestRepository.lockUserForLeaveRequestWrite(data.userId, tx);
    await assertNoOverlap(data.userId, data.startDate, data.endDate, undefined, tx);

    // Leave types that don't require approval (e.g. sick leave) are approved on submission.
    if (!leaveType.requiresApproval) {
      await adjustLeaveBalanceOnStatusChange(
        tx,
        data.userId,
        data.leaveTypeId,
        data.totalDays,
        data.startDate.getUTCFullYear(),
        'Pending',
        'Approval'
      );
      return await leaveRequestRepository.createLeaveRequest({ ...data, status: 'Approval' }, tx);
    }

    const created = await leaveRequestRepository.createLeaveRequest(
      { ...data, status: 'Pending' },
      tx
    );

    if (requester?.managerId) {
      await notificationRepository.createNotification(
        {
          userId: requester.managerId,
          message: `${requester.firstName} ${requester.lastName} submitted a leave request.`,
          isRead: false,
          type: 'LeaveRequestSubmitted',
        },
        tx
      );
    }

    return created;
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
  if (!isOwner && !isManagerOrHr(requestingUserRole)) {
    throw new ForbiddenError('You can only delete your own leave requests');
  }
  if (leaveRequest.status !== 'Pending') {
    throw new ConflictError('Only pending leave requests can be deleted');
  }

  return await leaveRequestRepository.removeLeaveRequest(leaveRequestId);
}
