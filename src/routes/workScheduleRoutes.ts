import { Router } from "express";
import {
  getAllWorkSchedulesHandler,
  getWorkScheduleByIdHandler,
  createWorkScheduleHandler,
  updateWorkScheduleHandler,
  deleteWorkScheduleHandler,
} from "../controllers/workScheduleController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import {
  createWorkScheduleSchema,
  updateWorkScheduleSchema,
} from "../validation/workScheduleSchemas";
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get("/work-schedules", authMiddleware, getAllWorkSchedulesHandler);
router.get(
  "/work-schedules/:workScheduleId",
  authMiddleware,
  getWorkScheduleByIdHandler,
);
router.post(
  "/work-schedules",
  authMiddleware,
  requireRole("Hr"),
  validate(createWorkScheduleSchema),
  createWorkScheduleHandler,
);
router.put(
  "/work-schedules/:workScheduleId",
  authMiddleware,
  requireRole("Hr"),
  validate(updateWorkScheduleSchema),
  updateWorkScheduleHandler,
);
router.delete(
  "/work-schedules/:workScheduleId",
  authMiddleware,
  requireRole("Hr"),
  deleteWorkScheduleHandler,
);

export default router;
