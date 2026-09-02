import type { Request, Response, NextFunction } from 'express';
import * as statusHistoryService from '../services/statusHistoryService';

export async function getAllStatusHistoriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const statusHistories = await statusHistoryService.getAllStatusHistories(req.user!.companyId);
    res.json(statusHistories);
  } catch (err) {
    next(err);
  }
}

export async function getStatusHistoryByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const statusHistoryId = Number(req.params.statusHistoryId);
    const statusHistory = await statusHistoryService.getStatusHistoryById(statusHistoryId, req.user!.companyId);
    res.json(statusHistory);
  } catch (err) {
    next(err);
  }
}

export async function createStatusHistoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { leaveRequestId, oldStatus, newStatus } = req.body;
    const statusHistory = await statusHistoryService.createStatusHistory({
      leaveRequestId,
      changedById: req.user!.userId,
      companyId: req.user!.companyId,
      oldStatus,
      newStatus,
    });
    res.status(201).json(statusHistory);
  } catch (err) {
    next(err);
  }
}