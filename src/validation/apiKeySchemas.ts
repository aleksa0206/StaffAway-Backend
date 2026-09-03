import { z } from 'zod';

export const createApiKeySchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1).max(255),
});