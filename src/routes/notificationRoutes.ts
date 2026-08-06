import { Router } from "express";
import {
  getAllNotificationsHandler,
  getNotificationByIdHandler,
  createNotificationHandler,
  updateNotificationHandler,
  deleteNotificationHandler,
} from "../controllers/notificationController";

const router = Router();

router.get("/notifications", getAllNotificationsHandler);
router.get("/notifications/:notificationId", getNotificationByIdHandler);
router.post("/notifications", createNotificationHandler);
router.put("/notifications/:notificationId", updateNotificationHandler);
router.delete("/notifications/:notificationId", deleteNotificationHandler);

export default router;
