import type { Request, Response } from "express";
import * as holidayService from "../services/holidayService";

export async function getAllHolidaysHandler(req: Request, res: Response) {
  try {
    const holiday = await holidayService.getAllHolidays();

    res.json(holiday);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getHolidayByIdHandler(req: Request, res: Response) {
  try {
    const holidayId = Number(req.params.holidayId);

    const holiday = await holidayService.getHolidayById(holidayId);

    res.json(holiday);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createHolidayHandler(req: Request, res: Response) {
  try {
    const { name, companyId, isRecurring, date } = req.body;
    const holiday = await holidayService.createHoliday({
      name,
      companyId,
      isRecurring,
      date: new Date(date),
    });
    res.status(201).json(holiday);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateHolidayHandler(req: Request, res: Response) {
  try {
    const holidayId = Number(req.params.holidayId);
    const { name, companyId, isRecurring, date } = req.body;
    const holiday = await holidayService.updateHoliday(holidayId, {
      name,
      companyId,
      isRecurring,
      date,
    });
    res.json(holiday);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteHolidayHandler(req: Request, res: Response) {
  try {
    const holidayId = Number(req.params.holidayId);
    const holiday = await holidayService.deleteHoliday(holidayId);
    res.json(holiday);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
