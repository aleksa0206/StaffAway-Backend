import type { Request, Response, NextFunction } from 'express';
import * as leaveBalanceService from '../services/leaveBalanceService';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';

export async function getAllLeaveBalancesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePagination(req);
    const { data, total } = await leaveBalanceService.getAllLeaveBalances(
      req.user!.companyId,
      pagination
    );
    res.json({ data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) });
  } catch (err) {
    next(err);
  }
}

export async function getLeaveBalanceByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const leaveBalanceId = Number(req.params.leaveBalanceId);
    const leaveBalance = await leaveBalanceService.getLeaveBalanceById(
      leaveBalanceId,
      req.user!.companyId
    );
    res.json(leaveBalance);
  } catch (err) {
    next(err);
  }
}

export async function createLeaveBalanceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, leaveTypeId, year, totalDays, usedDays } = req.body;
    const leaveBalance = await leaveBalanceService.createLeaveBalance({
      userId,
      leaveTypeId,
      companyId: req.user!.companyId,
      year,
      totalDays,
      usedDays,
    });
    res.status(201).json(leaveBalance);
  } catch (err) {
    next(err);
  }
}

export async function updateLeaveBalanceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const leaveBalanceId = Number(req.params.leaveBalanceId);
    const { totalDays, usedDays } = req.body;
    const leaveBalance = await leaveBalanceService.updateLeaveBalance(
      leaveBalanceId,
      req.user!.companyId,
      { totalDays, usedDays }
    );
    res.json(leaveBalance);
  } catch (err) {
    next(err);
  }
}

export async function deleteLeaveBalanceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const leaveBalanceId = Number(req.params.leaveBalanceId);
    const leaveBalance = await leaveBalanceService.deleteLeaveBalance(
      leaveBalanceId,
      req.user!.companyId
    );
    res.json(leaveBalance);
  } catch (err) {
    next(err);
  }
}
