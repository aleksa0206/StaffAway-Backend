import type { Request, Response } from "express";
import * as leaveBalanceService from "../services/leaveBalanceService";

export async function getAllLeaveBalancesHandler(req: Request, res: Response) {
  try {
    const leaveBalances = await leaveBalanceService.getAllLeaveBalances();
    res.json(leaveBalances);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getLeaveBalanceByIdHandler(req: Request, res: Response) {
  try {
    const leaveBalanceId = Number(req.params.leaveBalanceId);
    const leaveBalance = await leaveBalanceService.getLeaveBalanceById(leaveBalanceId);
    res.json(leaveBalance);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createLeaveBalanceHandler(req: Request, res: Response) {
  try {
    const { userId, leaveTypeId, companyId, year, totalDays, usedDays } = req.body;
    const leaveBalance = await leaveBalanceService.createLeaveBalance({
      userId,
      leaveTypeId,
      companyId,
      year,
      totalDays,
      usedDays,
    });
    res.status(201).json(leaveBalance);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateLeaveBalanceHandler(req: Request, res: Response) {
  try {
    const leaveBalanceId = Number(req.params.leaveBalanceId);
    const { userId, leaveTypeId, companyId, year, totalDays, usedDays } = req.body;
    const leaveBalance = await leaveBalanceService.updateLeaveBalance(leaveBalanceId, {
      userId,
      leaveTypeId,
      companyId,
      year,
      totalDays,
      usedDays,
    });
    res.json(leaveBalance);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteLeaveBalanceHandler(req: Request, res: Response) {
  try {
    const leaveBalanceId = Number(req.params.leaveBalanceId);
    const leaveBalance = await leaveBalanceService.deleteLeaveBalance(leaveBalanceId);
    res.json(leaveBalance);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}