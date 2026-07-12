import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'ID is required'),
    vehicleId: z.string().min(1),
    type: z.enum(['Oil Change', 'Tyre', 'Brake', 'Engine', 'Battery', 'Inspection']),
    status: z.enum(['Scheduled', 'Active', 'Completed']).default('Scheduled'),
    cost: z.number().nonnegative(),
    startDate: z.string().min(10),
    endDate: z.string().nullable().optional(),
    odometer: z.number().nonnegative(),
    mechanicDetails: z.string().min(1),
    remarks: z.string().optional().default(''),
  }),
});

export const updateMaintenanceSchema = z.object({
  body: createMaintenanceSchema.shape.body.partial().omit({ id: true }),
});
