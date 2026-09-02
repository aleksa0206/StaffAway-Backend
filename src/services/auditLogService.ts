import * as auditLogRepository from '../repositories/auditLogRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

export async function getAllAuditLogs(companyId: number) {
  return await auditLogRepository.findAllAuditLogs(companyId);
}

export async function getAuditLogById(auditLogId: number, companyId: number) {
  const auditLog = await auditLogRepository.findAuditLogById(auditLogId);

  if (!auditLog) throw new NotFoundError('AuditLog');
  if (auditLog.companyId !== companyId) throw new ForbiddenError();

  return auditLog;
}

export async function createAuditLog(data: {
  entityType: string;
  entityId: number;
  action: string;
  performedById: number;
  companyId: number;
  oldValue?: string;
  newValue?: string;
}) {
  return await auditLogRepository.createAuditLog(data);
}