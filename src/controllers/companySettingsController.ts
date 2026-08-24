import type { Request, Response } from "express";
import * as companySettingsService from "../services/companySettingsService";

export async function getCompanySettingsHandler(req: Request, res: Response) {
  try {
    if (!req.user) {
        return res.status(401).json({ error: 'Niste autentifikovani' });
    }
    const companyId = req.user.companyId;
    const settings = await companySettingsService.getCompanySettings(companyId);
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createCompanySettingsHandler(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user) {
        return res.status(401).json({ error: 'Niste autentifikovani' });
    }
    const companyId = req.user.companyId;
    const {
      companyName,
      minDaysNoticeForLeave,
      defaultAnnualLeaveDays,
      workWeekStartsMonday,
    } = req.body;
    const settings = await companySettingsService.createCompanySettings({
      companyId,
      companyName,
      minDaysNoticeForLeave,
      defaultAnnualLeaveDays,
      workWeekStartsMonday,
    });
    res.status(201).json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateCompanySettingsHandler(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user) {
        return res.status(401).json({ error: 'Niste autentifikovani' });
    }
    const companyId = req.user.companyId;
    const {
      companyName,
      minDaysNoticeForLeave,
      defaultAnnualLeaveDays,
      workWeekStartsMonday,
    } = req.body;
    const settings = await companySettingsService.updateCompanySettings(
      companyId,
      {
        companyName,
        minDaysNoticeForLeave,
        defaultAnnualLeaveDays,
        workWeekStartsMonday,
      },
    );
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
