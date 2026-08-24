import { Router } from "express";
import {
  getAllNotificationsHandler,
  getNotificationByIdHandler,
  createNotificationHandler,
  updateNotificationHandler,
  deleteNotificationHandler,
} from "../controllers/notificationController";
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get("/notifications",authMiddleware, getAllNotificationsHandler);
router.get("/notifications/:notificationId",authMiddleware, getNotificationByIdHandler);
router.post("/notifications",authMiddleware, createNotificationHandler);
router.put("/notifications/:notificationId",authMiddleware, updateNotificationHandler);
router.delete("/notifications/:notificationId",authMiddleware, deleteNotificationHandler);

export default router;
