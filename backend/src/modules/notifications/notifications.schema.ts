import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'ID is required'),
    userId: z.string().nullable().optional(),
    type: z.enum(['Maintenance Due', 'License Expiry', 'Trip Assigned', 'Trip Completed', 'High Fuel Usage', 'Alert']),
    title: z.string().min(1),
    message: z.string().min(1),
    date: z.string().min(10),
    read: z.boolean().default(false),
    severity: z.enum(['info', 'warning', 'critical']),
  }),
});
