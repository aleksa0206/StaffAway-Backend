import { Notification } from "@prisma/client";
import { prisma } from "../config/prismaClient";

export async function findAllNotifications(): Promise<Notification[]> {
  return await prisma.notification.findMany();
}

export async function findNotificationById(
  notificationId: number,
): Promise<Notification | null> {
  return await prisma.notification.findUnique({
    where: { id: notificationId },
  });
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
}): Promise<Notification> {
  return await prisma.notification.create({ data });
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
): Promise<Notification> {
  return await prisma.notification.update({
    where: { id: notificationId },
    data,
  });
}

export async function removeNotification(
  notificationId: number,
): Promise<Notification> {
  return await prisma.notification.delete({ where: { id: notificationId } });
}
