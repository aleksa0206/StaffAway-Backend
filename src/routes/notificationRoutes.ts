import { Router } from 'express';
import {
  getAllNotificationsHandler,
  getNotificationByIdHandler,
  updateNotificationHandler,
  deleteNotificationHandler,
} from '../controllers/notificationController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { updateNotificationSchema } from '../validation/notificationSchemas';

const router = Router();

router.get('/notifications', authMiddleware, getAllNotificationsHandler);
router.get('/notifications/:notificationId', authMiddleware, getNotificationByIdHandler);
router.put(
  '/notifications/:notificationId',
  authMiddleware,
  validate(updateNotificationSchema),
  updateNotificationHandler
);
router.delete('/notifications/:notificationId', authMiddleware, deleteNotificationHandler);

export default router;
