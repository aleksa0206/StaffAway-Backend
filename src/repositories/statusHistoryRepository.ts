import { StatusHistory } from "@prisma/client";
import { prisma } from "../config/prismaClient";

export async function findAllStatusHistories(): Promise<StatusHistory[]> {
  return await prisma.statusHistory.findMany();
}

export async function findStatusHistoryById(
  statusHistoryId: number,
): Promise<StatusHistory | null> {
  return await prisma.statusHistory.findUnique({
    where: { id: statusHistoryId },
  });
}

export async function createStatusHistory(data: {
  leaveRequestId: number;
  changedById: number;
  companyId: number;
  oldStatus: "Pending" | "Approval" | "Rejected";
  newStatus: "Pending" | "Approval" | "Rejected";
}): Promise<StatusHistory> {
  return await prisma.statusHistory.create({ data });
}
