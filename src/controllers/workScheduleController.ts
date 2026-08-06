import type { Request, Response } from "express";
import * as workScheduleService from "../services/workScheduleService";

export async function getAllWorkSchedulesHandler(req: Request, res: Response) {
  try {
    const workSchedule = await workScheduleService.getAllWorkSchedules();

    res.json(workSchedule);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getWorkScheduleByIdHandler(req: Request, res: Response) {
  try {
    const workScheduleId = Number(req.params.workScheduleId);

    const workSchedule =
      await workScheduleService.getWorkScheduleById(workScheduleId);

    res.json(workSchedule);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createWorkScheduleHandler(req: Request, res: Response) {
  try {
    const { userId, companyId, hoursPerWeek, isPartTime } = req.body;
    const workSchedule = await workScheduleService.createWorkSchedule({
      userId,
      companyId,
      hoursPerWeek,
      isPartTime,
    });
    res.status(201).json(workSchedule);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateWorkScheduleHandler(req: Request, res: Response) {
  try {
    const workScheduleId = Number(req.params.workScheduleId);
    const { userId, companyId, hoursPerWeek, isPartTime } = req.body;
    const updateWorkSchedule = await workScheduleService.updateWorkSchedule(
      workScheduleId,
      { userId, companyId, hoursPerWeek, isPartTime },
    );
    res.json(updateWorkSchedule);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteWorkScheduleHandler(req: Request, res: Response) {
  try {
    const workScheduleId = Number(req.params.workScheduleId);
    const workSchedule =
      await workScheduleService.deleteWorkSchedule(workScheduleId);
    res.json(workSchedule);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
