import { Router } from 'express';
import { getAllAuditLogsHandler, getAuditLogByIdHandler } from '../controllers/auditLogController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/audit-logs', authMiddleware, requireRole('Manager', 'Hr'), getAllAuditLogsHandler);
router.get(
  '/audit-logs/:auditLogId',
  authMiddleware,
  requireRole('Manager', 'Hr'),
  getAuditLogByIdHandler
);

export default router;
