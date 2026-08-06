import { Router } from "express";
import {
  getAllWorkSchedulesHandler,
  getWorkScheduleByIdHandler,
  createWorkScheduleHandler,
  updateWorkScheduleHandler,
  deleteWorkScheduleHandler,
} from "../controllers/workScheduleController";

const router = Router();

router.get("/work-schedules", getAllWorkSchedulesHandler);
router.get("/work-schedules/:workScheduleId", getWorkScheduleByIdHandler);
router.post("/work-schedules", createWorkScheduleHandler);
router.put("/work-schedules/:workScheduleId", updateWorkScheduleHandler);
router.delete("/work-schedules/:workScheduleId", deleteWorkScheduleHandler);

export default router;
