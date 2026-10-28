import type { AuditLog, Prisma } from '@prisma/client';
import { prisma } from '../config/prismaClient';
import type { NewAuditLogEntry } from '../types/auditLog';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

const withPerformedByName = {
  performedBy: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.AuditLogInclude;

export async function findAllAuditLogs(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  const findAuditLogsOnPage = prisma.auditLog.findMany({
    where: { companyId },
    include: withPerformedByName,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip: pagination.skip,
    take: pagination.take,
  });

  const countAllAuditLogs = prisma.auditLog.count({
    where: { companyId },
  });

  const [auditLogsOnPage, totalAuditLogs] = await Promise.all([
    findAuditLogsOnPage,
    countAllAuditLogs,
  ]);

  return { data: auditLogsOnPage, total: totalAuditLogs };
}

export async function findAuditLogById(auditLogId: number) {
  return await prisma.auditLog.findUnique({
    where: { id: auditLogId },
    include: withPerformedByName,
  });
}

export async function createAuditLog(
  entry: NewAuditLogEntry,
  client: PrismaClientOrTx = prisma
): Promise<AuditLog> {
  return await client.auditLog.create({ data: entry });
}
