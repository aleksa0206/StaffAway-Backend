import { Router } from "express";
import {
  getAllHolidaysHandler,
  getHolidayByIdHandler,
  createHolidayHandler,
  updateHolidayHandler,
  deleteHolidayHandler,
} from "../controllers/holidayController";
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { createHolidaySchema, updateHolidaySchema } from '../validation/holidaySchemas';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get("/holidays", authMiddleware, getAllHolidaysHandler);
router.get("/holidays/:holidayId", authMiddleware, getHolidayByIdHandler);
router.post("/holidays", authMiddleware, requireRole('Hr'), validate(createHolidaySchema), createHolidayHandler);
router.put('/holidays/:holidayId', authMiddleware, requireRole('Hr'), validate(updateHolidaySchema), updateHolidayHandler);
router.delete("/holidays/:holidayId", authMiddleware, requireRole('Hr'), deleteHolidayHandler);


export default router;