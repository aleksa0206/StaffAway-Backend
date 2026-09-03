import { z } from 'zod';

export const createAttachmentSchema = z.object({
  leaveRequestId: z.number().int().positive(),
  fileName: z.string().min(1).max(255),
  filePath: z.string().min(1),
});