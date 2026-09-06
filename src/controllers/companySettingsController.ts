import type { Request, Response, NextFunction } from 'express';
import * as companySettingsService from '../services/companySettingsService';

export async function getCompanySettingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await companySettingsService.getCompanySettings(req.user!.companyId);
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function createCompanySettingsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { companyName, minDaysNoticeForLeave, defaultAnnualLeaveDays, workWeekStartsMonday } =
      req.body;
    const settings = await companySettingsService.createCompanySettings({
      companyId: req.user!.companyId,
      companyName,
      minDaysNoticeForLeave,
      defaultAnnualLeaveDays,
      workWeekStartsMonday,
    });
    res.status(201).json(settings);
  } catch (err) {
    next(err);
  }
}

export async function updateCompanySettingsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { companyName, minDaysNoticeForLeave, defaultAnnualLeaveDays, workWeekStartsMonday } =
      req.body;
    const settings = await companySettingsService.updateCompanySettings(req.user!.companyId, {
      companyName,
      minDaysNoticeForLeave,
      defaultAnnualLeaveDays,
      workWeekStartsMonday,
    });
    res.json(settings);
  } catch (err) {
    next(err);
  }
}
