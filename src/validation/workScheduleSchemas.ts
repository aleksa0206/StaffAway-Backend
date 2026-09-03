import { z } from 'zod';

export const createWorkScheduleSchema = z.object({
  userId: z.number().int().positive(),
  hoursPerWeek: z.number().int().min(1).max(168),
  isPartTime: z.boolean(),
});

export const updateWorkScheduleSchema = z.object({
  hoursPerWeek: z.number().int().min(1).max(168).optional(),
  isPartTime: z.boolean().optional(),
});