import type { Request, Response } from "express";
import * as auditLogService from "../services/auditLogService";

export async function getAllAuditLogsHandler(req: Request, res: Response) {
  try {
    const auditLogs = await auditLogService.getAllAuditLogs();
    res.json(auditLogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAuditLogByIdHandler(req: Request, res: Response) {
  try {
    const auditLogId = Number(req.params.auditLogId);
    const auditLog = await auditLogService.getAuditLogById(auditLogId);
    res.json(auditLog);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAuditLogHandler(req: Request, res: Response) {
  try {
    const { entityType, entityId, action, performedById, companyId, oldValue, newValue } = req.body;
    const auditLog = await auditLogService.createAuditLog({
      entityType,
      entityId,
      action,
      performedById,
      companyId,
      oldValue,
      newValue,
    });
    res.status(201).json(auditLog);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAuditLogHandler(req: Request, res: Response) {
  try {
    const auditLogId = Number(req.params.auditLogId);
    const auditLog = await auditLogService.deleteAuditLog(auditLogId);
    res.json(auditLog);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}