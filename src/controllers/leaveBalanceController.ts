import type { Request, Response } from 'express';
import * as leaveBalanceService from '../services/leaveBalanceService';
import { handleControllerError } from '../errors/handleControllerError';
import { notFound } from '../errors/AppError';

export async function getAllLeaveBalancesHandler(req: Request, res: Response) {
  try {
    const leaveBalances = await leaveBalanceService.getAllLeaveBalances(req.user!.companyId);
    res.json(leaveBalances);
  } catch (err) {
    handleControllerError(err, res);
  }
}

export async function getLeaveBalanceByIdHandler(req: Request, res: Response) {
  try {
    const leaveBalanceId = Number(req.params.leaveBalanceId);
    const leaveBalance = await leaveBalanceService.getLeaveBalanceById(leaveBalanceId, req.user!.companyId);
    res.json(leaveBalance);
  } catch (err) {
    handleControllerError(err, res);
  }
}

export async function createLeaveBalanceHandler(req: Request, res: Response) {
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
    handleControllerError(err, res);
  }
}

export async function updateLeaveBalanceHandler(req: Request, res: Response) {
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
    handleControllerError(err, res);
  }
}

export async function deleteLeaveBalanceHandler(req: Request, res: Response) {
  try {
    const leaveBalanceId = Number(req.params.leaveBalanceId);
    const leaveBalance = await leaveBalanceService.deleteLeaveBalance(leaveBalanceId, req.user!.companyId);
    res.json(leaveBalance);
  } catch (err) {
    handleControllerError(err, res);
  }
}