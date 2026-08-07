import * as statusHistoryRepository from "../repositories/statusHistoryRepository";

export async function getAllStatusHistories() {
  return await statusHistoryRepository.findAllStatusHistories();
}

export async function getStatusHistoryById(statusHistoryId: number) {
  return await statusHistoryRepository.findStatusHistoryById(statusHistoryId);
}

export async function createStatusHistory(data: {
  leaveRequestId: number;
  changedById: number;
  companyId: number;
  oldStatus: "Pending" | "Approval" | "Rejected";
  newStatus: "Pending" | "Approval" | "Rejected";
}) {
  return await statusHistoryRepository.createStatusHistory(data);
}