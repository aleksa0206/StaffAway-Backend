import type { Request, Response } from "express";
import * as leaveRequestService from "../services/leaveRequestService";
import type { Prisma } from "@prisma/client";

export async function getAllLeaveRequestsHandler(req: Request, res: Response) {
  try {
    const leaveRequests = await leaveRequestService.getAllLeaveRequests();
    res.json(leaveRequests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getLeaveRequestByIdHandler(req: Request, res: Response) {
  try {
    const leaveRequestId = Number(req.params.leaveRequestId);
    const leaveRequest =
      await leaveRequestService.getLeaveRequestById(leaveRequestId);
    res.json(leaveRequest);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createLeaveRequestHandler(req: Request, res: Response) {
  try {
    const {
      startDate,
      endDate,
      totalDays,
      status,
      comment,
      userId,
      approvedById,
      leaveTypeId,
      companyId,
    } = req.body;
    const leaveRequest = await leaveRequestService.createLeaveRequest({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays,
      status,
      comment,
      userId,
      approvedById,
      leaveTypeId,
      companyId,
    });
    res.status(201).json(leaveRequest);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateLeaveRequestHandler(req: Request, res: Response) {
  try {
    const leaveRequestId = Number(req.params.leaveRequestId);
    const {
      startDate,
      endDate,
      totalDays,
      status,
      comment,
      approvedById,
      leaveTypeId,
      companyId,
    } = req.body;
    const leaveRequest = await leaveRequestService.updateLeaveRequest(
      leaveRequestId,
      {
        startDate: startDate && new Date(startDate),
        endDate: endDate && new Date(endDate),
        totalDays,
        status,
        comment,
        approvedById,
        leaveTypeId,
        companyId,
      },
    );
    res.json(leaveRequest);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteLeaveRequestHandler(req: Request, res: Response) {
  try {
    const leaveRequestId = Number(req.params.leaveRequestId);
    const leaveRequest =
      await leaveRequestService.deleteLeaveRequest(leaveRequestId);
    res.json(leaveRequest);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
