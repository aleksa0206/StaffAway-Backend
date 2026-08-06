import type { Request, Response } from "express";
import * as notificationService from "../services/notificationService";

export async function getAllNotificationsHandler(req: Request, res: Response) {
  try {
    const notification = await notificationService.getAllNotifications();

    res.json(notification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getNotificationByIdHandler(req: Request, res: Response) {
  try {
    const notificationId = Number(req.params.notificationId);

    const notification =
      await notificationService.getNotificationById(notificationId);

    res.json(notification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createNotificationHandler(req: Request, res: Response) {
  try {
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
    const notificationId = Number(req.params.notificationId);
    const { userId, message, isRead, type } = req.body;
    const updateNotification = await notificationService.updateNotification(
      notificationId,
      { userId, message, isRead, type },
    );
    res.json(updateNotification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteNotificationHandler(req: Request, res: Response) {
  try {
    const notificationId = Number(req.params.notificationId);
    const notification =
      await notificationService.deleteNotification(notificationId);
    res.json(notification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
