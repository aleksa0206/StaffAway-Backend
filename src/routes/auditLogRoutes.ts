import { Router } from "express";
import {
  getAllAuditLogsHandler,
  getAuditLogByIdHandler,
  createAuditLogHandler,
  deleteAuditLogHandler,
} from "../controllers/auditLogController";

const router = Router();

router.get("/audit-logs", getAllAuditLogsHandler);
router.get("/audit-logs/:auditLogId", getAuditLogByIdHandler);
router.post("/audit-logs", createAuditLogHandler);
router.delete("/audit-logs/:auditLogId", deleteAuditLogHandler);

export default router;