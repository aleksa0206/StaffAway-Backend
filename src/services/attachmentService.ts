import * as attachmentRepository from '../repositories/attachmentRepository';
import * as leaveRequestRepository from '../repositories/leaveRequestRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import * as fileStorageService from './fileStorageService';

export async function getAllAttachments(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  return await attachmentRepository.findAllAttachmentsByCompany(companyId, pagination);
}

export async function getAttachmentById(attachmentId: number, companyId: number) {
  const attachment = await attachmentRepository.findAttachmentById(attachmentId);

  if (!attachment) {
    throw new NotFoundError('Attachment');
  }
  if (attachment.leaveRequest?.companyId !== companyId) {
    throw new ForbiddenError();
  }

  return attachment;
}

export async function createAttachment(
  data: { leaveRequestId: number; fileBuffer: Buffer; originalFileName: string; mimeType: string },
  companyId: number
) {
  const leaveRequest = await leaveRequestRepository.findLeaveRequestById(data.leaveRequestId);

  if (!leaveRequest) {
    throw new NotFoundError('LeaveRequest');
  }
  if (leaveRequest.companyId !== companyId) {
    throw new ForbiddenError('Cannot attach file to a leave request outside your company');
  }

  const key = await fileStorageService.uploadFile(data.fileBuffer, data.originalFileName, data.mimeType);

  return await attachmentRepository.createAttachment({
    leaveRequestId: data.leaveRequestId,
    fileName: data.originalFileName,
    filePath: key,
  });
}

export async function deleteAttachment(attachmentId: number, companyId: number) {
  const attachment = await attachmentRepository.findAttachmentById(attachmentId);

  if (!attachment) {
    throw new NotFoundError('Attachment');
  }
  if (attachment.leaveRequest?.companyId !== companyId) {
    throw new ForbiddenError();
  }

  await fileStorageService.deleteFile(attachment.filePath);

  return await attachmentRepository.removeAttachment(attachmentId);
}

export async function toResponseShape(attachment: { fileName: string; filePath: string; [key: string]: unknown }) {
  const { filePath, ...rest } = attachment;
  const fileUrl = await fileStorageService.getSignedFileUrl(filePath);
  return { ...rest, fileUrl };
}
