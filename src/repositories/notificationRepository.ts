import { Notification } from '@prisma/client';
import { prisma } from '../config/prismaClient';
import { Prisma } from '@prisma/client';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export async function findAllNotifications(
  userId: number,
  pagination: { skip: number; take: number }
) {
  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { data, total };
}

export async function findNotificationById(notificationId: number): Promise<Notification | null> {
  return await prisma.notification.findUnique({ where: { id: notificationId } });
}

export async function createNotification(
  data: {
    userId: number;
    message: string;
    isRead: boolean;
    type: 'LeaveRequestSubmitted' | 'LeaveRequestApproved' | 'LeaveRequestRejected' | 'General';
  },
  client: PrismaClientOrTx = prisma
): Promise<Notification> {
  return await client.notification.create({ data });
}

export async function updateNotification(
  notificationId: number,
  data: {
    message?: string;
    isRead?: boolean;
    type?: 'LeaveRequestSubmitted' | 'LeaveRequestApproved' | 'LeaveRequestRejected' | 'General';
  }
): Promise<Notification> {
  return await prisma.notification.update({ where: { id: notificationId }, data });
}

export async function removeNotification(notificationId: number): Promise<Notification> {
  return await prisma.notification.delete({ where: { id: notificationId } });
}
