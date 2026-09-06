import type { Request, Response, NextFunction } from 'express';
import * as attachmentService from '../services/attachmentService';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';

export async function getAllAttachmentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePagination(req);
    const { data, total } = await attachmentService.getAllAttachments(
      req.user!.companyId,
      pagination
    );
    res.json({ data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) });
  } catch (err) {
    next(err);
  }
}
export async function getAttachmentByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const attachmentId = Number(req.params.attachmentId);
    const attachment = await attachmentService.getAttachmentById(attachmentId, req.user!.companyId);
    res.json(attachment);
  } catch (err) {
    next(err);
  }
}

export async function createAttachmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { leaveRequestId, fileName, filePath } = req.body;
    const attachment = await attachmentService.createAttachment(
      { leaveRequestId, fileName, filePath },
      req.user!.companyId
    );
    res.status(201).json(attachment);
  } catch (err) {
    next(err);
  }
}

export async function deleteAttachmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const attachmentId = Number(req.params.attachmentId);
    const attachment = await attachmentService.deleteAttachment(attachmentId, req.user!.companyId);
    res.json(attachment);
  } catch (err) {
    next(err);
  }
}
