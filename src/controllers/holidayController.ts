import type { Request, Response, NextFunction } from 'express';
import * as holidayService from '../services/holidayService';

export async function getAllHolidaysHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const holidays = await holidayService.getAllHolidays(req.user!.companyId);
    res.json(holidays);
  } catch (err) {
    next(err);
  }
}

export async function getHolidayByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const holidayId = Number(req.params.holidayId);
    const holiday = await holidayService.getHolidayById(holidayId, req.user!.companyId);
    res.json(holiday);
  } catch (err) {
    next(err);
  }
}

export async function createHolidayHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, isRecurring, date } = req.body;
    const holiday = await holidayService.createHoliday({
      name,
      isRecurring,
      date: new Date(date),
      companyId: req.user!.companyId,
    });
    res.status(201).json(holiday);
  } catch (err) {
    next(err);
  }
}

export async function updateHolidayHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const holidayId = Number(req.params.holidayId);
    const { name, isRecurring, date } = req.body;
    const holiday = await holidayService.updateHoliday(
      holidayId,
      req.user!.companyId,
      { name, isRecurring, date: date && new Date(date) }
    );
    res.json(holiday);
  } catch (err) {
    next(err);
  }
}

export async function deleteHolidayHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const holidayId = Number(req.params.holidayId);
    const holiday = await holidayService.deleteHoliday(holidayId, req.user!.companyId);
    res.json(holiday);
  } catch (err) {
    next(err);
  }
}