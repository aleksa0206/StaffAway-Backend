import { Attachment } from '@prisma/client';
import { prisma } from '../config/prismaClient';

export async function findAllAttachmentsByCompany(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  const where = { leaveRequest: { companyId } };
  const [data, total] = await Promise.all([
    prisma.attachment.findMany({ where, skip: pagination.skip, take: pagination.take }),
    prisma.attachment.count({ where }),
  ]);
  return { data, total };
}

export async function findAttachmentById(attachmentId: number) {
  return await prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: { leaveRequest: { select: { companyId: true } } },
  });
}

export async function createAttachment(data: {
  leaveRequestId: number;
  fileName: string;
  filePath: string;
}): Promise<Attachment> {
  return await prisma.attachment.create({ data });
}

export async function removeAttachment(attachmentId: number): Promise<Attachment> {
  return await prisma.attachment.delete({ where: { id: attachmentId } });
}
