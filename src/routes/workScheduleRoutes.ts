import { Router } from "express";
import {
  getAllWorkSchedulesHandler,
  getWorkScheduleByIdHandler,
  createWorkScheduleHandler,
  updateWorkScheduleHandler,
  deleteWorkScheduleHandler,
} from "../controllers/workScheduleController";
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get("/work-schedules",authMiddleware, getAllWorkSchedulesHandler);
router.get("/work-schedules/:workScheduleId",authMiddleware, getWorkScheduleByIdHandler);
router.post("/work-schedules",authMiddleware, createWorkScheduleHandler);
router.put("/work-schedules/:workScheduleId",authMiddleware, updateWorkScheduleHandler);
router.delete("/work-schedules/:workScheduleId",authMiddleware, deleteWorkScheduleHandler);

export default router;
