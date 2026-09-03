import { z } from 'zod';

export const createAuditLogSchema = z.object({
  entityType: z.string().min(1).max(100),
  entityId: z.number().int().positive(),
  action: z.string().min(1).max(100),
  oldValue: z.string().optional(),
  newValue: z.string().optional(),
});