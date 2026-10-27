import { z } from 'zod';

// The message and type are written by the system; the recipient can only mark it read.
export const updateNotificationSchema = z.object({
  isRead: z.boolean(),
});
