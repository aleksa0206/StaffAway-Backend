import type { Request, Response } from "express";
import * as leaveTypeService from "../services/leaveTypeService";

export async function getAllLeaveTypesHandler(req: Request, res: Response) {
  try {
    const leaveTypes = await leaveTypeService.getAllLeaveTypes();

    res.json(leaveTypes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getLeaveTypeByIdHandler(req: Request, res: Response) {
  try {
    const leaveTypeId = Number(req.params.leaveTypeId);

    const leaveType = await leaveTypeService.getLeaveTypeById(leaveTypeId);

    res.json(leaveType);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createLeaveTypeHandler(req: Request, res: Response) {
  try {
    const { name, requiresApproval, countsTowardBalance, companyId } = req.body;
    const newLeaveType = await leaveTypeService.createLeaveType({
      name,
      requiresApproval,
      countsTowardBalance,
      companyId,
    });
    res.status(201).json(newLeaveType);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateLeaveTypeHandler(req: Request, res: Response) {
  try {
    const leaveTypeId = Number(req.params.leaveTypeId);
    const { name, requiresApproval, countsTowardBalance, companyId } = req.body;
    const updateLeaveType = await leaveTypeService.updateLeaveType(
      leaveTypeId,
      { name, requiresApproval, countsTowardBalance, companyId },
    );
    res.json(updateLeaveType);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteLeaveTypeHandler(req: Request, res: Response) {
  try {
    const leaveTypeId = Number(req.params.leaveTypeId);
    const leaveType = await leaveTypeService.deleteLeaveType(leaveTypeId);
    res.json(leaveType);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
