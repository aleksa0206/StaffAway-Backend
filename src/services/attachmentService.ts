import * as attachmentRepository from "../repositories/attachmentRepository";

export async function getAllAttachments() {
  return await attachmentRepository.findAllAttachments();
}

export async function getAttachmentById(attachmentId: number) {
  return await attachmentRepository.findAttachmentById(attachmentId);
}

export async function createAttachment(data: {
  leaveRequestId: number;
  fileName: string;
  filePath: string;
}) {
  return await attachmentRepository.createAttachment(data);
}

export async function deleteAttachment(attachmentId: number) {
  return await attachmentRepository.removeAttachment(attachmentId);
}
