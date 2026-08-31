import type { Request, Response } from 'express';
import * as attachmentService from '../services/attachmentService';
import { handleControllerError } from '../errors/handleControllerError';

export async function getAllAttachmentsHandler(req: Request, res: Response) {
    try {
        const attachments = await attachmentService.getAllAttachments(
            req.user!.companyId,
        );
        res.json(attachments);
    } catch (err) {
        handleControllerError(err, res);
    }
}

export async function getAttachmentByIdHandler(req: Request, res: Response) {
    try {
        const attachmentId = Number(req.params.attachmentId);
        const attachment = await attachmentService.getAttachmentById(
            attachmentId,
            req.user!.companyId,
        );
        res.json(attachment);
    } catch (err) {
        handleControllerError(err, res);
    }
}

export async function createAttachmentHandler(req: Request, res: Response) {
    try {
        const { leaveRequestId, fileName, filePath } = req.body;
        const attachment = await attachmentService.createAttachment(
            { leaveRequestId, fileName, filePath },
            req.user!.companyId,
        );
        res.status(201).json(attachment);
    } catch (err) {
        handleControllerError(err, res);
    }
}

export async function deleteAttachmentHandler(req: Request, res: Response) {
    try {
        const attachmentId = Number(req.params.attachmentId);
        const attachment = await attachmentService.deleteAttachment(
            attachmentId,
            req.user!.companyId,
        );
        res.json(attachment);
    } catch (err) {
        handleControllerError(err, res);
    }
}
