import * as notificationRepository from "../repositories/notificationRepository";

export async function getAllNotifications() {
  return await notificationRepository.findAllNotifications();
}

export async function getNotificationById(notificationId: number) {
  return await notificationRepository.findNotificationById(notificationId);
}

export async function createNotification(data: {
  userId: number;
  message: string;
  isRead: boolean;
  type:
    | "LeaveRequestSubmitted"
    | "LeaveRequestApproved"
    | "LeaveRequestRejected"
    | "General";
}) {
  return await notificationRepository.createNotification(data);
}

export async function updateNotification(
  notificationId: number,
  data: {
    userId?: number;
    message?: string;
    isRead?: boolean;
    type?:
      | "LeaveRequestSubmitted"
      | "LeaveRequestApproved"
      | "LeaveRequestRejected"
      | "General";
  },
) {
  return await notificationRepository.updateNotification(notificationId, data);
}

export async function deleteNotification(notificationId: number) {
  return await notificationRepository.removeNotification(notificationId);
}
