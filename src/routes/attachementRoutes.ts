import { Router } from "express";
import {
  getAllAttachmentsHandler,
  getAttachmentByIdHandler,
  createAttachmentHandler,
  deleteAttachmentHandler,
} from "../controllers/attachmentController";

const router = Router();

router.get("/attachments", getAllAttachmentsHandler);
router.get("/attachments/:attachmentId", getAttachmentByIdHandler);
router.post("/attachments", createAttachmentHandler);
router.delete("/attachments/:attachmentId", deleteAttachmentHandler);

export default router;
