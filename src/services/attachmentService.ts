import * as attachmentRepository from '../repositories/attachmentRepository';
import * as leaveRequestRepository from '../repositories/leaveRequestRepository';
import { notFound, forbidden } from '../errors/AppError';

export async function getAllAttachments(companyId: number) {
    return await attachmentRepository.findAllAttachmentsByCompany(companyId);
}

export async function getAttachmentById(
    attachmentId: number,
    companyId: number,
) {
    const attachment =
        await attachmentRepository.findAttachmentById(attachmentId);

    if (!attachment) {
        throw notFound('Attachment');
    }
    if (attachment.leaveRequest?.companyId !== companyId) {
        throw forbidden();
    }

    return attachment;
}

export async function createAttachment(
    data: { leaveRequestId: number; fileName: string; filePath: string },
    companyId: number,
) {
    // Provera VLASNIŠTVA nad LeaveRequest-om pre nego što ga kačimo
    const leaveRequest = await leaveRequestRepository.findLeaveRequestById(
        data.leaveRequestId,
    );

    if (!leaveRequest) {
        throw notFound('LeaveRequest');
    }
    if (leaveRequest.companyId !== companyId) {
        throw forbidden(
            'Cannot attach file to a leave request outside your company',
        );
    }

    return await attachmentRepository.createAttachment(data);
}

export async function deleteAttachment(
    attachmentId: number,
    companyId: number,
) {
    const attachment =
        await attachmentRepository.findAttachmentById(attachmentId);

    if (!attachment) {
        throw notFound('Attachment');
    }
    if (attachment.leaveRequest?.companyId !== companyId) {
        throw forbidden();
    }

    return await attachmentRepository.removeAttachment(attachmentId);
}
