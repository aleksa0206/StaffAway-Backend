import type { Request, Response } from 'express';
import * as notificationService from '../services/notificationService';

export async function getAllNotificationsHandler(req: Request, res: Response) {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Niste autentifikovani' });
        const userId = req.user.userId;
        const notifications =
            await notificationService.getAllNotifications(userId);
        res.json(notifications);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getNotificationByIdHandler(req: Request, res: Response) {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Niste autentifikovani' });
        const userId = req.user.userId;
        const notificationId = Number(req.params.notificationId);
        const notification = await notificationService.getNotificationById(
            notificationId,
            userId,
        );
        res.json(notification);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createNotificationHandler(req: Request, res: Response) {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Niste autentifikovani' });
        const { userId, message, isRead, type } = req.body;
        const notification = await notificationService.createNotification({
            userId,
            message,
            isRead,
            type,
        });
        res.status(201).json(notification);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateNotificationHandler(req: Request, res: Response) {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Niste autentifikovani' });
        const userId = req.user.userId;
        const notificationId = Number(req.params.notificationId);
        const { isRead } = req.body;
        const notification = await notificationService.updateNotification(
            notificationId,
            userId,
            { isRead },
        );
        res.json(notification);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}

export async function deleteNotificationHandler(req: Request, res: Response) {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Niste autentifikovani' });
        const userId = req.user.userId;
        const notificationId = Number(req.params.notificationId);
        const notification = await notificationService.deleteNotification(
            notificationId,
            userId,
        );
        res.json(notification);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}
