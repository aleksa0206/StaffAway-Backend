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
import { upload } from '../middleware/upload';

const router = Router();

router.get('/attachments', authMiddleware, getAllAttachmentsHandler);
router.post(
  '/attachments',
  authMiddleware,
  upload.single('file'),
  validate(createAttachmentSchema),
  createAttachmentHandler
);
router.get('/attachments/:attachmentId', authMiddleware, getAttachmentByIdHandler);
router.delete('/attachments/:attachmentId', authMiddleware, deleteAttachmentHandler);

export default router;
