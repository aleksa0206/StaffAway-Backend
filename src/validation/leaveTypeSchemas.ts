import { z } from 'zod';

export const createLeaveTypeSchema = z.object({
  name: z.string().min(1).max(255),
  requiresApproval: z.boolean(),
  countsTowardBalance: z.boolean(),
});

export const updateLeaveTypeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  requiresApproval: z.boolean().optional(),
  countsTowardBalance: z.boolean().optional(),
});
