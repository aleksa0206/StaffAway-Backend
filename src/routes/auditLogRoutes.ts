import { Router } from "express";
import {
  getAllAuditLogsHandler,
  getAuditLogByIdHandler,
  createAuditLogHandler,
} from "../controllers/auditLogController";
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get("/audit-logs",authMiddleware, getAllAuditLogsHandler);
router.get("/audit-logs/:auditLogId",authMiddleware, getAuditLogByIdHandler);
router.post("/audit-logs",authMiddleware, createAuditLogHandler);

export default router;