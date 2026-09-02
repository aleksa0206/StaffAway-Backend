import type { Request, Response, NextFunction } from 'express';
import * as auditLogService from '../services/auditLogService';

export async function getAllAuditLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const auditLogs = await auditLogService.getAllAuditLogs(req.user!.companyId);
    res.json(auditLogs);
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const auditLogId = Number(req.params.auditLogId);
    const auditLog = await auditLogService.getAuditLogById(auditLogId, req.user!.companyId);
    res.json(auditLog);
  } catch (err) {
    next(err);
  }
}

export async function createAuditLogHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { entityType, entityId, action, oldValue, newValue } = req.body;
    const auditLog = await auditLogService.createAuditLog({
      entityType,
      entityId,
      action,
      performedById: req.user!.userId,
      companyId: req.user!.companyId,
      oldValue,
      newValue,
    });
    res.status(201).json(auditLog);
  } catch (err) {
    next(err);
  }
}