import { Attachment } from '@prisma/client';
import { prisma } from '../config/prismaClient';

export async function findAllAttachmentsByCompany(
    companyId: number,
): Promise<Attachment[]> {
    return await prisma.attachment.findMany({
        where: { leaveRequest: { companyId } },
    });
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

export async function removeAttachment(
    attachmentId: number,
): Promise<Attachment> {
    return await prisma.attachment.delete({ where: { id: attachmentId } });
}
