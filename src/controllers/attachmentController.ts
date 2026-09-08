import type { Request, Response, NextFunction } from 'express';
import * as attachmentService from '../services/attachmentService';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';
import { upload } from '../middleware/upload';


export async function getAllAttachmentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePagination(req);
    const { data, total } = await attachmentService.getAllAttachments(req.user!.companyId, pagination);
    const responseData = await Promise.all(data.map(attachmentService.toResponseShape));
    res.json({
      data: responseData,
      meta: buildPaginationMeta(total, pagination.page, pagination.limit),
    });
  } catch (err) {
    next(err);
  }
}
export async function getAttachmentByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const attachmentId = Number(req.params.attachmentId);
    const attachment = await attachmentService.getAttachmentById(attachmentId, req.user!.companyId);
    const responseShape = await attachmentService.toResponseShape(attachment);
    res.json(responseShape);
  } catch (err) {
    next(err);
  }
}

export async function createAttachmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'File is required' });
      return;
    }

    const { leaveRequestId } = req.body;

    const attachment = await attachmentService.createAttachment(
      {
        leaveRequestId,
        fileBuffer: req.file.buffer,
        originalFileName: req.file.originalname,
        mimeType: req.file.mimetype,
      },
      req.user!.companyId
    );

    const responseShape = await attachmentService.toResponseShape(attachment);
    res.status(201).json(responseShape);
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
