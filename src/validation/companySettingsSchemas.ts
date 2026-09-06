import { z } from 'zod';

export const createCompanySettingsSchema = z.object({
  companyName: z.string().min(1).max(255),
  minDaysNoticeForLeave: z.number().int().min(0).optional(),
  defaultAnnualLeaveDays: z.number().int().min(0).optional(),
  workWeekStartsMonday: z.boolean().optional(),
});

export const updateCompanySettingsSchema = z.object({
  companyName: z.string().min(1).max(255).optional(),
  minDaysNoticeForLeave: z.number().int().min(0).optional(),
  defaultAnnualLeaveDays: z.number().int().min(0).optional(),
  workWeekStartsMonday: z.boolean().optional(),
});
