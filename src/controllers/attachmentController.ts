import type { Request, Response } from "express";
import * as attachmentService from "../services/attachmentService";

export async function getAllAttachmentsHandler(req: Request, res: Response) {
  try {
    const attachments = await attachmentService.getAllAttachments();
    res.json(attachments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAttachmentByIdHandler(req: Request, res: Response) {
  try {
    const attachmentId = Number(req.params.attachmentId);
    const attachment = await attachmentService.getAttachmentById(attachmentId);
    res.json(attachment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAttachmentHandler(req: Request, res: Response) {
  try {
    const { leaveRequestId, fileName, filePath } = req.body;
    const attachment = await attachmentService.createAttachment({ leaveRequestId, fileName, filePath });
    res.status(201).json(attachment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAttachmentHandler(req: Request, res: Response) {
  try {
    const attachmentId = Number(req.params.attachmentId);
    const attachment = await attachmentService.deleteAttachment(attachmentId);
    res.json(attachment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}