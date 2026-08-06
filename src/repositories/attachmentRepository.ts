import { Attachment } from "@prisma/client";
import { prisma } from "../config/prismaClient";

export async function findAllAttachments(): Promise<Attachment[]> {
  return await prisma.attachment.findMany();
}

export async function findAttachmentById(attachmentId: number): Promise<Attachment | null> {
  return await prisma.attachment.findUnique({ where: { id: attachmentId } });
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