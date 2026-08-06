import { Router } from "express";
import {
  getAllHolidaysHandler,
  getHolidayByIdHandler,
  createHolidayHandler,
  updateHolidayHandler,
  deleteHolidayHandler,
} from "../controllers/holidayController";

const router = Router();

router.get("/holidays", getAllHolidaysHandler);
router.get("/holidays/:holidayId", getHolidayByIdHandler);
router.post("/holidays", createHolidayHandler);
router.put("/holidays/:holidayId", updateHolidayHandler);
router.delete("/holidays/:holidayId", deleteHolidayHandler);

export default router;
