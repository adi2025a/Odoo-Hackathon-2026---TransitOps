import { z } from 'zod';

export const createFuelLogSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'ID is required'),
    vehicleId: z.string().min(1),
    tripId: z.string().nullable().optional(),
    driverId: z.string().min(1),
    fuelQuantity: z.number().positive(),
    fuelCost: z.number().positive(),
    station: z.string().min(1),
    date: z.string().min(10),
    odometer: z.number().nonnegative(),
  }),
});
