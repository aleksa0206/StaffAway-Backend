import * as attachmentRepository from '../repositories/attachmentRepository';
import * as leaveRequestRepository from '../repositories/leaveRequestRepository';
import { visibleUserIdsFor } from './userService';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { ValidationError } from '../errors/ValidationError';
import { getContainer } from '../container';
import { logger } from '../config/logger';

type RequestingUser = { companyId: number; userId: number; role: string };

// The MIME type is whatever the client claims; the first bytes of the file are what it really is.
const FILE_SIGNATURES: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/jpeg': [0xff, 0xd8, 0xff],
};

function assertContentMatchesType(buffer: Buffer, mimeType: string) {
  const signature = FILE_SIGNATURES[mimeType];
  if (!signature || !signature.every((byte, i) => buffer[i] === byte)) {
    throw new ValidationError('File content does not match its type');
  }
}

async function assertCanAccess(
  leaveRequest: { companyId: number; userId: number } | null | undefined,
  requestingUser: RequestingUser
) {
  if (leaveRequest?.companyId !== requestingUser.companyId) {
    throw new ForbiddenError();
  }
  const visibleUserIds = await visibleUserIdsFor(requestingUser);
  if (visibleUserIds && !visibleUserIds.includes(leaveRequest.userId)) {
    throw new ForbiddenError();
  }
}

export async function getAllAttachments(
  requestingUser: RequestingUser,
  filters: { leaveRequestId?: number | undefined },
  pagination: { skip: number; take: number }
) {
  return await attachmentRepository.findAllAttachmentsByCompany(
    requestingUser.companyId,
    {
      leaveRequestId: filters.leaveRequestId,
      ownerUserIds: await visibleUserIdsFor(requestingUser),
    },
    pagination
  );
}

export async function getAttachmentById(attachmentId: number, requestingUser: RequestingUser) {
  const attachment = await attachmentRepository.findAttachmentById(attachmentId);

  if (!attachment) {
    throw new NotFoundError('Attachment');
  }
  await assertCanAccess(attachment.leaveRequest, requestingUser);

  return attachment;
}

export async function createAttachment(
  data: { leaveRequestId: number; fileBuffer: Buffer; originalFileName: string; mimeType: string },
  requestingUser: RequestingUser
) {
  const { fileStorage } = getContainer();

  const leaveRequest = await leaveRequestRepository.findLeaveRequestById(data.leaveRequestId);

  if (!leaveRequest) {
    throw new NotFoundError('LeaveRequest');
  }
  await assertCanAccess(leaveRequest, requestingUser);
  assertContentMatchesType(data.fileBuffer, data.mimeType);

  const key = await fileStorage.uploadFile(data.fileBuffer, data.originalFileName, data.mimeType);

  return await attachmentRepository.createAttachment({
    leaveRequestId: data.leaveRequestId,
    fileName: data.originalFileName,
    filePath: key,
  });
}

export async function deleteAttachment(attachmentId: number, requestingUser: RequestingUser) {
  const { fileStorage } = getContainer();

  const attachment = await attachmentRepository.findAttachmentById(attachmentId);

  if (!attachment) {
    throw new NotFoundError('Attachment');
  }
  await assertCanAccess(attachment.leaveRequest, requestingUser);

  // Row first: if S3 then fails, an orphaned file is harmless, a row pointing at nothing is not.
  const deleted = await attachmentRepository.removeAttachment(attachmentId);
  try {
    await fileStorage.deleteFile(attachment.filePath);
  } catch (err) {
    logger.error({ err, key: attachment.filePath }, 'Failed to delete attachment file from S3');
  }

  return deleted;
}

export async function toResponseShape(attachment: {
  fileName: string;
  filePath: string;
  [key: string]: unknown;
}) {
  const { fileStorage } = getContainer();
  const { filePath, ...rest } = attachment;
  const fileUrl = await fileStorage.getSignedFileUrl(filePath);
  return { ...rest, fileUrl };
}
