import { z } from 'zod';

export const createStatusHistorySchema = z.object({
  leaveRequestId: z.number().int().positive(),
  oldStatus: z.enum(['Pending', 'Approval', 'Rejected']),
  newStatus: z.enum(['Pending', 'Approval', 'Rejected']),
});
