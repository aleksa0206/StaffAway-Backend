import { Router } from "express";
import {
  getAllNotificationsHandler,
  getNotificationByIdHandler,
  createNotificationHandler,
  updateNotificationHandler,
  deleteNotificationHandler,
} from "../controllers/notificationController";
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { createNotificationSchema, updateNotificationSchema } from '../validation/notificationSchemas';

const router = Router();

router.get("/notifications", authMiddleware, getAllNotificationsHandler);
router.get("/notifications/:notificationId", authMiddleware, getNotificationByIdHandler);
router.post("/notifications", authMiddleware, validate(createNotificationSchema), createNotificationHandler);
router.put("/notifications/:notificationId", authMiddleware, validate(updateNotificationSchema), updateNotificationHandler);
router.delete("/notifications/:notificationId", authMiddleware, deleteNotificationHandler);

export default router;