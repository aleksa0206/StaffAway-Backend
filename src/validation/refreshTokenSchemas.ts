import { z } from 'zod';

export const createRefreshTokenSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.coerce.date(),
});