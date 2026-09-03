import { z } from 'zod';

export const createLeaveBalanceSchema = z.object({
  userId: z.number().int().positive(),
  leaveTypeId: z.number().int().positive(),
  year: z.number().int().min(2000).max(2100),
  totalDays: z.number().int().min(0),
  usedDays: z.number().int().min(0),
});

export const updateLeaveBalanceSchema = z.object({
  totalDays: z.number().int().min(0).optional(),
  usedDays: z.number().int().min(0).optional(),
});