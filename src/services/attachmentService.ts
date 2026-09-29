import * as attachmentRepository from '../repositories/attachmentRepository';
import * as leaveRequestRepository from '../repositories/leaveRequestRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { getContainer } from '../container';

type RequestingUser = { companyId: number; userId: number; role: string };

function isPrivileged(role: string) {
  return role === 'Manager' || role === 'Hr';
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
      ownerUserId: isPrivileged(requestingUser.role) ? undefined : requestingUser.userId,
    },
    pagination
  );
}

export async function getAttachmentById(attachmentId: number, requestingUser: RequestingUser) {
  const attachment = await attachmentRepository.findAttachmentById(attachmentId);

  if (!attachment) {
    throw new NotFoundError('Attachment');
  }
  if (attachment.leaveRequest?.companyId !== requestingUser.companyId) {
    throw new ForbiddenError();
  }
  if (
    !isPrivileged(requestingUser.role) &&
    attachment.leaveRequest?.userId !== requestingUser.userId
  ) {
    throw new ForbiddenError();
  }

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
  if (leaveRequest.companyId !== requestingUser.companyId) {
    throw new ForbiddenError('Cannot attach file to a leave request outside your company');
  }
  if (!isPrivileged(requestingUser.role) && leaveRequest.userId !== requestingUser.userId) {
    throw new ForbiddenError('You can only attach files to your own leave requests');
  }

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
  if (attachment.leaveRequest?.companyId !== requestingUser.companyId) {
    throw new ForbiddenError();
  }
  if (
    !isPrivileged(requestingUser.role) &&
    attachment.leaveRequest?.userId !== requestingUser.userId
  ) {
    throw new ForbiddenError();
  }

  await fileStorage.deleteFile(attachment.filePath);

  return await attachmentRepository.removeAttachment(attachmentId);
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
