import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(1).max(255),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1).max(255).optional(),
});
