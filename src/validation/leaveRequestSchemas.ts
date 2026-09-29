import { z } from 'zod';

export const createLeaveRequestSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    totalDays: z.number().int().positive(),
    comment: z.string().max(1000).optional(),
    leaveTypeId: z.number().int().positive(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  });

export const updateLeaveRequestSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  totalDays: z.number().int().positive().optional(),
  status: z.enum(['Pending', 'Approval', 'Rejected', 'Cancelled']).optional(),
  comment: z.string().max(1000).optional(),
});
