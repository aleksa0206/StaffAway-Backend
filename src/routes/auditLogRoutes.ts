import { Router } from 'express';
import {
  getAllAuditLogsHandler,
  getAuditLogByIdHandler,
  createAuditLogHandler,
} from '../controllers/auditLogController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { createAuditLogSchema } from '../validation/auditLogSchemas';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/audit-logs', authMiddleware, requireRole('Manager', 'Hr'), getAllAuditLogsHandler);
router.get(
  '/audit-logs/:auditLogId',
  authMiddleware,
  requireRole('Manager', 'Hr'),
  getAuditLogByIdHandler
);
router.post('/audit-logs', authMiddleware, createAuditLogHandler);

export default router;
