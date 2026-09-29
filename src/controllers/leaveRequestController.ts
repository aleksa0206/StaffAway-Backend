import type { Request, Response, NextFunction } from 'express';
import * as leaveRequestService from '../services/leaveRequestService';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';
import { LEAVE_REQUEST_SORTS } from '../repositories/leaveRequestRepository';
import {
  parseOptionalDateQuery,
  parseOptionalEnumListQuery,
  parseOptionalEnumQuery,
  parseOptionalIdQuery,
} from '../utils/queryParams';

const LEAVE_STATUSES = ['Pending', 'Approval', 'Rejected', 'Cancelled'] as const;

export async function getAllLeaveRequestsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePagination(req);
    const filters = {
      userId: parseOptionalIdQuery(req, 'userId'),
      managerId: parseOptionalIdQuery(req, 'managerId'),
      departmentId: parseOptionalIdQuery(req, 'departmentId'),
      statuses: parseOptionalEnumListQuery(req, 'status', LEAVE_STATUSES),
      from: parseOptionalDateQuery(req, 'from'),
      to: parseOptionalDateQuery(req, 'to'),
      sort: parseOptionalEnumQuery(req, 'sort', LEAVE_REQUEST_SORTS),
    };
    const { data, total } = await leaveRequestService.getAllLeaveRequests(
      req.user!.companyId,
      filters,
      pagination,
      req.user!
    );
    res.json({ data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) });
  } catch (err) {
    next(err);
  }
}

export async function getLeaveRequestByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const leaveRequestId = Number(req.params.leaveRequestId);
    const leaveRequest = await leaveRequestService.getLeaveRequestById(
      leaveRequestId,
      req.user!.companyId,
      req.user!
    );
    res.json(leaveRequest);
  } catch (err) {
    next(err);
  }
}

export async function createLeaveRequestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate, totalDays, comment, leaveTypeId } = req.body;
    const leaveRequest = await leaveRequestService.createLeaveRequest({
      startDate,
      endDate,
      totalDays,
      comment,
      leaveTypeId,
      userId: req.user!.userId,
      companyId: req.user!.companyId,
    });
    res.status(201).json(leaveRequest);
  } catch (err) {
    next(err);
  }
}

export async function updateLeaveRequestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const leaveRequestId = Number(req.params.leaveRequestId);
    const { startDate, endDate, totalDays, status, comment } = req.body;
    const leaveRequest = await leaveRequestService.updateLeaveRequest(
      leaveRequestId,
      req.user!.companyId,
      req.user!.userId,
      req.user!.role,
      { startDate, endDate, totalDays, status, comment }
    );
    res.json(leaveRequest);
  } catch (err) {
    next(err);
  }
}

export async function deleteLeaveRequestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const leaveRequestId = Number(req.params.leaveRequestId);
    const leaveRequest = await leaveRequestService.deleteLeaveRequest(
      leaveRequestId,
      req.user!.companyId,
      req.user!.userId,
      req.user!.role
    );
    res.json(leaveRequest);
  } catch (err) {
    next(err);
  }
}
