import { Router } from "express";
import {
  getAllStatusHistoriesHandler,
  getStatusHistoryByIdHandler,
  createStatusHistoryHandler,
} from "../controllers/statusHistoryController";
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { createStatusHistorySchema } from '../validation/statusHistorySchemas';

const router = Router();

router.get("/status-histories", authMiddleware, getAllStatusHistoriesHandler);
router.get("/status-histories/:statusHistoryId", authMiddleware, getStatusHistoryByIdHandler);
router.post("/status-histories", authMiddleware, validate(createStatusHistorySchema), createStatusHistoryHandler);

export default router;