import * as notificationRepository from '../repositories/notificationRepository';

export async function getAllNotifications(userId: number) {
    return await notificationRepository.findAllNotifications(userId);
}

export async function getNotificationById(
    notificationId: number,
    userId: number,
) {
    const notification =
        await notificationRepository.findNotificationById(notificationId);
    if (!notification || notification.userId !== userId) {
        return null;
    }
    return notification;
}

export async function createNotification(data: {
    userId: number;
    message: string;
    isRead: boolean;
    type:
        | 'LeaveRequestSubmitted'
        | 'LeaveRequestApproved'
        | 'LeaveRequestRejected'
        | 'General';
}) {
    return await notificationRepository.createNotification(data);
}

export async function updateNotification(
    notificationId: number,
    userId: number,
    data: { isRead?: boolean },
) {
    const notification =
        await notificationRepository.findNotificationById(notificationId);
    if (!notification) throw new Error('Obaveštenje ne postoji');
    if (notification.userId !== userId)
        throw new Error('Nemate pravo pristupa ovom obaveštenju');
    return await notificationRepository.updateNotification(
        notificationId,
        data,
    );
}

export async function deleteNotification(
    notificationId: number,
    userId: number,
) {
    const notification =
        await notificationRepository.findNotificationById(notificationId);
    if (!notification) throw new Error('Obaveštenje ne postoji');
    if (notification.userId !== userId)
        throw new Error('Nemate pravo pristupa ovom obaveštenju');
    return await notificationRepository.removeNotification(notificationId);
}
