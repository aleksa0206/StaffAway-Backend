import { z } from 'zod';

const notificationType = z.enum([
  'LeaveRequestSubmitted',
  'LeaveRequestApproved',
  'LeaveRequestRejected',
  'General',
]);

export const updateNotificationSchema = z.object({
  message: z.string().min(1).max(1000).optional(),
  isRead: z.boolean().optional(),
  type: notificationType.optional(),
});
