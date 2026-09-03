import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(1).max(255),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});