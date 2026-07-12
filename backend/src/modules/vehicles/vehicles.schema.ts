import { z } from 'zod';

export const createVehicleSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'ID is required'),
    regNumber: z.string().min(1, 'Registration number is required'),
    name: z.string().min(1, 'Name is required'),
    model: z.string().min(1, 'Model is required'),
    type: z.string().min(1, 'Type is required'),
    manufacturer: z.string().min(1, 'Manufacturer is required'),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
    vin: z.string().min(17, 'VIN must be at least 17 characters'),
    fuelType: z.enum(['Diesel', 'Electric', 'Gasoline', 'CNG']),
    loadCapacity: z.number().positive(),
    odometer: z.number().nonnegative(),
    purchaseCost: z.number().positive(),
    insuranceExpiry: z.string().min(10),
    fitnessExpiry: z.string().min(10),
    pucExpiry: z.string().min(10),
    status: z.enum(['Available', 'On Trip', 'Maintenance', 'Retired']).default('Available'),
    region: z.enum(['North', 'South', 'East', 'West', 'Central']),
    assignedDriverId: z.string().nullable().optional(),
    photoColor: z.string().min(1),
  }),
});

export const updateVehicleSchema = z.object({
  body: createVehicleSchema.shape.body.partial().omit({ id: true }),
});

export const updateVehicleStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Available', 'On Trip', 'Maintenance', 'Retired']),
  }),
});
