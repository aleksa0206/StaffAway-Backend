import { z } from 'zod';

export const createCommentSchema = z.object({
  leaveRequestId: z.number().int().positive(),
  text: z.string().min(1).max(2000),
});

export const updateCommentSchema = z.object({
  text: z.string().min(1).max(2000).optional(),
});
