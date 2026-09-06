import type { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notificationService';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';

export async function getAllNotificationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePagination(req);
    const { data, total } = await notificationService.getAllNotifications(
      req.user!.userId,
      pagination
    );
    res.json({ data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) });
  } catch (err) {
    next(err);
  }
}

export async function getNotificationByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const notificationId = Number(req.params.notificationId);
    const notification = await notificationService.getNotificationById(
      notificationId,
      req.user!.userId
    );
    res.json(notification);
  } catch (err) {
    next(err);
  }
}

export async function createNotificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, message, isRead, type } = req.body;
    const notification = await notificationService.createNotification({
      userId,
      message,
      isRead,
      type,
    });
    res.status(201).json(notification);
  } catch (err) {
    next(err);
  }
}

export async function updateNotificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const notificationId = Number(req.params.notificationId);
    const { message, isRead, type } = req.body;
    const updated = await notificationService.updateNotification(notificationId, req.user!.userId, {
      message,
      isRead,
      type,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteNotificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const notificationId = Number(req.params.notificationId);
    const notification = await notificationService.deleteNotification(
      notificationId,
      req.user!.userId
    );
    res.json(notification);
  } catch (err) {
    next(err);
  }
}
