import * as auditLogRepository from "../repositories/auditLogRepository";

export async function getAllAuditLogs() {
  return await auditLogRepository.findAllAuditLogs();
}

export async function getAuditLogById(auditLogId: number) {
  return await auditLogRepository.findAuditLogById(auditLogId);
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

export async function deleteAuditLog(auditLogId: number) {
  return await auditLogRepository.removeAuditLog(auditLogId);
}