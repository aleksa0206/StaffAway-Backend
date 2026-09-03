import { Prisma, StatusHistory } from "@prisma/client";
import { prisma } from "../config/prismaClient";

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export async function findAllStatusHistories(
  companyId: number,
): Promise<StatusHistory[]> {
  return await prisma.statusHistory.findMany({ where: { companyId } });
}

export async function findStatusHistoryById(
  statusHistoryId: number,
): Promise<StatusHistory | null> {
  return await prisma.statusHistory.findUnique({
    where: { id: statusHistoryId },
  });
}

export async function createStatusHistory(
  data: {
    leaveRequestId: number;
    changedById: number;
    companyId: number;
    oldStatus: "Pending" | "Approval" | "Rejected";
    newStatus: "Pending" | "Approval" | "Rejected";
  },
  client: PrismaClientOrTx = prisma,
) {
  return await client.statusHistory.create({ data });
}
