import type { Request, Response, NextFunction } from 'express';
import * as workScheduleService from '../services/workScheduleService';

export async function getAllWorkSchedulesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const workSchedules = await workScheduleService.getAllWorkSchedules(req.user!.companyId);
    res.json(workSchedules);
  } catch (err) {
    next(err);
  }
}

export async function getWorkScheduleByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const workScheduleId = Number(req.params.workScheduleId);
    const workSchedule = await workScheduleService.getWorkScheduleById(workScheduleId, req.user!.companyId);
    res.json(workSchedule);
  } catch (err) {
    next(err);
  }
}

export async function createWorkScheduleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, hoursPerWeek, isPartTime } = req.body;
    const workSchedule = await workScheduleService.createWorkSchedule({
      userId,
      hoursPerWeek,
      isPartTime,
      companyId: req.user!.companyId,
    });
    res.status(201).json(workSchedule);
  } catch (err) {
    next(err);
  }
}

export async function updateWorkScheduleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const workScheduleId = Number(req.params.workScheduleId);
    const { hoursPerWeek, isPartTime } = req.body;
    const workSchedule = await workScheduleService.updateWorkSchedule(
      workScheduleId,
      req.user!.companyId,
      { hoursPerWeek, isPartTime }
    );
    res.json(workSchedule);
  } catch (err) {
    next(err);
  }
}

export async function deleteWorkScheduleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const workScheduleId = Number(req.params.workScheduleId);
    const workSchedule = await workScheduleService.deleteWorkSchedule(workScheduleId, req.user!.companyId);
    res.json(workSchedule);
  } catch (err) {
    next(err);
  }
}