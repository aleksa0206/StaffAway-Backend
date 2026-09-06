import { Router } from 'express';
import {
  getAllAttachmentsHandler,
  getAttachmentByIdHandler,
  createAttachmentHandler,
  deleteAttachmentHandler,
} from '../controllers/attachmentController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { createAttachmentSchema } from '../validation/attachmentSchemas';

const router = Router();

router.get('/attachments', authMiddleware, getAllAttachmentsHandler);
router.get('/attachments/:attachmentId', authMiddleware, getAttachmentByIdHandler);
router.post(
  '/attachments',
  authMiddleware,
  validate(createAttachmentSchema),
  createAttachmentHandler
);
router.delete('/attachments/:attachmentId', authMiddleware, deleteAttachmentHandler);

export default router;
