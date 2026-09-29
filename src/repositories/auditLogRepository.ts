import { AuditLog } from '@prisma/client';
import { prisma } from '../config/prismaClient';

export async function findAllAuditLogs(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { companyId },
      include: { performedBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.auditLog.count({ where: { companyId } }),
  ]);
  return { data, total };
}

export async function findAuditLogById(auditLogId: number): Promise<AuditLog | null> {
  return await prisma.auditLog.findUnique({ where: { id: auditLogId } });
}

export async function createAuditLog(data: {
  entityType: string;
  entityId: number;
  action: string;
  performedById: number;
  companyId: number;
  oldValue?: string;
  newValue?: string;
}): Promise<AuditLog> {
  return await prisma.auditLog.create({ data });
}

export async function removeAuditLog(auditLogId: number): Promise<AuditLog> {
  return await prisma.auditLog.delete({ where: { id: auditLogId } });
}
