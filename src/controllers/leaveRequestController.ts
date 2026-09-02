import type { Request, Response, NextFunction } from 'express';
import * as leaveRequestService from '../services/leaveRequestService';

export async function getAllLeaveRequestsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const leaveRequests = await leaveRequestService.getAllLeaveRequests(req.user!.companyId);
    res.json(leaveRequests);
  } catch (err) {
    next(err);
  }
}

export async function getLeaveRequestByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const leaveRequestId = Number(req.params.leaveRequestId);
    const leaveRequest = await leaveRequestService.getLeaveRequestById(leaveRequestId, req.user!.companyId);
    res.json(leaveRequest);
  } catch (err) {
    next(err);
  }
}

export async function createLeaveRequestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate, totalDays, comment, leaveTypeId } = req.body;
    const leaveRequest = await leaveRequestService.createLeaveRequest({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
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
    const { startDate, endDate, totalDays, status, comment, approvedById } = req.body;
    const leaveRequest = await leaveRequestService.updateLeaveRequest(
      leaveRequestId,
      req.user!.companyId,
      {
        startDate: startDate && new Date(startDate),
        endDate: endDate && new Date(endDate),
        totalDays,
        status,
        comment,
        approvedById,
      }
    );
    res.json(leaveRequest);
  } catch (err) {
    next(err);
  }
}

export async function deleteLeaveRequestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const leaveRequestId = Number(req.params.leaveRequestId);
    const leaveRequest = await leaveRequestService.deleteLeaveRequest(leaveRequestId, req.user!.companyId);
    res.json(leaveRequest);
  } catch (err) {
    next(err);
  }
}
