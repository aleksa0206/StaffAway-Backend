import * as notificationRepository from '../repositories/notificationRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

export async function getAllNotifications(
  userId: number,
  filters: { isRead?: boolean | undefined },
  pagination: { skip: number; take: number }
) {
  return await notificationRepository.findAllNotifications(userId, filters, pagination);
}

export async function getNotificationById(notificationId: number, userId: number) {
  const notification = await notificationRepository.findNotificationById(notificationId);

  if (!notification) {
    throw new NotFoundError('Notification');
  }
  if (notification.userId !== userId) {
    throw new ForbiddenError();
  }

  return notification;
}

export async function updateNotification(
  notificationId: number,
  userId: number,
  data: {
    message?: string;
    isRead?: boolean;
    type?: 'LeaveRequestSubmitted' | 'LeaveRequestApproved' | 'LeaveRequestRejected' | 'General';
  }
) {
  const notification = await notificationRepository.findNotificationById(notificationId);

  if (!notification) {
    throw new NotFoundError('Notification');
  }
  if (notification.userId !== userId) {
    throw new ForbiddenError();
  }

  return await notificationRepository.updateNotification(notificationId, data);
}

export async function deleteNotification(notificationId: number, userId: number) {
  const notification = await notificationRepository.findNotificationById(notificationId);

  if (!notification) {
    throw new NotFoundError('Notification');
  }
  if (notification.userId !== userId) {
    throw new ForbiddenError();
  }

  return await notificationRepository.removeNotification(notificationId);
}
