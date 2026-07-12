import { z } from 'zod';

export const createExpenseSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'ID is required'),
    vehicleId: z.string().min(1),
    category: z.enum(['Fuel', 'Repair', 'Maintenance', 'Insurance', 'Parking', 'Toll', 'Tax', 'Miscellaneous']),
    amount: z.number().positive(),
    date: z.string().min(10),
    description: z.string().min(1),
    status: z.enum(['Approved', 'Pending', 'Rejected']).default('Pending'),
  }),
});

export const updateExpenseSchema = z.object({
  body: createExpenseSchema.shape.body.partial().omit({ id: true }),
});

export const approveExpenseSchema = z.object({
  body: z.object({
    status: z.enum(['Approved', 'Pending', 'Rejected']),
  }),
});
