import type { Request, Response, NextFunction } from 'express';
import * as leaveTypeService from '../services/leaveTypeService';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';

export async function getAllLeaveTypesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePagination(req);
    const { data, total } = await leaveTypeService.getAllLeaveTypes(
      req.user!.companyId,
      pagination
    );
    res.json({ data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) });
  } catch (err) {
    next(err);
  }
}

export async function getLeaveTypeByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const leaveTypeId = Number(req.params.leaveTypeId);
    const leaveType = await leaveTypeService.getLeaveTypeById(leaveTypeId, req.user!.companyId);
    res.json(leaveType);
  } catch (err) {
    next(err);
  }
}

export async function createLeaveTypeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, requiresApproval, countsTowardBalance } = req.body;
    const newLeaveType = await leaveTypeService.createLeaveType({
      name,
      requiresApproval,
      countsTowardBalance,
      companyId: req.user!.companyId,
    });
    res.status(201).json(newLeaveType);
  } catch (err) {
    next(err);
  }
}

export async function updateLeaveTypeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const leaveTypeId = Number(req.params.leaveTypeId);
    const { name, requiresApproval, countsTowardBalance } = req.body;
    const updated = await leaveTypeService.updateLeaveType(leaveTypeId, req.user!.companyId, {
      name,
      requiresApproval,
      countsTowardBalance,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteLeaveTypeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const leaveTypeId = Number(req.params.leaveTypeId);
    const deleted = await leaveTypeService.deleteLeaveType(leaveTypeId, req.user!.companyId);
    res.json(deleted);
  } catch (err) {
    next(err);
  }
}
