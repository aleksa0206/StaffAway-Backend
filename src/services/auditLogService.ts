import * as auditLogRepository from '../repositories/auditLogRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

export async function getAllAuditLogs(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  return await auditLogRepository.findAllAuditLogs(companyId, pagination);
}

export async function getAuditLogById(auditLogId: number, companyId: number) {
  const auditLog = await auditLogRepository.findAuditLogById(auditLogId);

  if (auditLog === null) {
    throw new NotFoundError('AuditLog');
  }

  const belongsToAnotherCompany = auditLog.companyId !== companyId;
  if (belongsToAnotherCompany) {
    throw new ForbiddenError();
  }

  return auditLog;
}
