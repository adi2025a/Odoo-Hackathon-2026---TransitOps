import { z } from 'zod';

export const createTripSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'ID is required'),
    source: z.string().min(1, 'Source is required'),
    destination: z.string().min(1, 'Destination is required'),
    stops: z.array(z.string()).default([]),
    distance: z.number().positive(),
    eta: z.string().min(10),
    cargoType: z.enum(['Electronics', 'Perishable Foods', 'Automotive', 'Chemicals', 'General Freight', 'Pharmaceuticals']),
    cargoWeight: z.number().positive(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
    vehicleId: z.string().min(1),
    driverId: z.string().min(1),
    status: z.enum(['Draft', 'Pending', 'Dispatched', 'On Trip', 'Completed', 'Cancelled']).default('Pending'),
    remarks: z.string().optional().default(''),
  }),
});

export const updateTripSchema = z.object({
  body: createTripSchema.shape.body.partial().omit({ id: true }),
});

export const updateTripStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Draft', 'Pending', 'Dispatched', 'On Trip', 'Completed', 'Cancelled']),
    remarks: z.string().optional(),
  }),
});

export const completeTripSchema = z.object({
  body: z.object({
    finalOdometer: z.number().positive(),
    fuelUsed: z.number().positive(),
    expenses: z.number().nonnegative(),
    deliveryProof: z.string().min(1),
    remarks: z.string().optional().default(''),
  }),
});
