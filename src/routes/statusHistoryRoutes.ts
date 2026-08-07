import { Router } from "express";
import {
  getAllStatusHistoriesHandler,
  getStatusHistoryByIdHandler,
  createStatusHistoryHandler,
} from "../controllers/statusHistoryController";

const router = Router();

router.get("/status-histories", getAllStatusHistoriesHandler);
router.get("/status-histories/:statusHistoryId", getStatusHistoryByIdHandler);
router.post("/status-histories", createStatusHistoryHandler);

export default router;