import type { Request, Response, NextFunction } from 'express';
import * as auditLogService from '../services/auditLogService';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';

export async function getAllAuditLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const companyId = req.user!.companyId;
    const pagination = parsePagination(req);

    const { data: auditLogs, total } = await auditLogService.getAllAuditLogs(companyId, pagination);

    const paginationMeta = buildPaginationMeta(total, pagination.page, pagination.limit);
    res.json({ data: auditLogs, meta: paginationMeta });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const companyId = req.user!.companyId;
    const auditLogId = Number(req.params.auditLogId);

    const auditLog = await auditLogService.getAuditLogById(auditLogId, companyId);

    res.json(auditLog);
  } catch (err) {
    next(err);
  }
}
