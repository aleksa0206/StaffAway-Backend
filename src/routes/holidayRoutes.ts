import { Router } from "express";
import {
  getAllHolidaysHandler,
  getHolidayByIdHandler,
  createHolidayHandler,
  updateHolidayHandler,
  deleteHolidayHandler,
} from "../controllers/holidayController";
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get("/holidays",authMiddleware, getAllHolidaysHandler);
router.get("/holidays/:holidayId",authMiddleware, getHolidayByIdHandler);
router.post("/holidays",authMiddleware, createHolidayHandler);
router.put('/holidays/:holidayId', authMiddleware, updateHolidayHandler);
router.delete("/holidays/:holidayId",authMiddleware, deleteHolidayHandler);

export default router;
