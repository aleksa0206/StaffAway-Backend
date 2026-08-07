import type { Request, Response } from "express";
import * as statusHistoryService from "../services/statusHistoryService";

export async function getAllStatusHistoriesHandler(req: Request, res: Response) {
  try {
    const statusHistories = await statusHistoryService.getAllStatusHistories();
    res.json(statusHistories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getStatusHistoryByIdHandler(req: Request, res: Response) {
  try {
    const statusHistoryId = Number(req.params.statusHistoryId);
    const statusHistory = await statusHistoryService.getStatusHistoryById(statusHistoryId);
    res.json(statusHistory);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createStatusHistoryHandler(req: Request, res: Response) {
  try {
    const { leaveRequestId, changedById, companyId, oldStatus, newStatus } = req.body;
    const statusHistory = await statusHistoryService.createStatusHistory({
      leaveRequestId,
      changedById,
      companyId,
      oldStatus,
      newStatus,
    });
    res.status(201).json(statusHistory);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}