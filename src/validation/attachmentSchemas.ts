import { z } from 'zod';

export const createAttachmentSchema = z.object({
  leaveRequestId: z.coerce.number().int().positive(),
});
