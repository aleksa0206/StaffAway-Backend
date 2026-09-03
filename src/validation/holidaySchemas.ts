import { z } from 'zod';

export const createHolidaySchema = z.object({
  name: z.string().min(1).max(255),
  date: z.coerce.date(),
  isRecurring: z.boolean(),
});

export const updateHolidaySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  date: z.coerce.date().optional(),
  isRecurring: z.boolean().optional(),
});