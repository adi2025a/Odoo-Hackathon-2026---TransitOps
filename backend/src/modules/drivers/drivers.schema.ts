import { z } from 'zod';

export const createDriverSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'ID is required'),
    name: z.string().min(1, 'Name is required'),
    dob: z.string().min(10),
    phone: z.string().min(10),
    email: z.string().email('Invalid email address'),
    address: z.string().min(1),
    emergencyContact: z.string().min(1),
    licenseNumber: z.string().min(1),
    licenseCategory: z.enum(['Class A CDL', 'Class B CDL', 'Class C']),
    licenseExpiry: z.string().min(10),
    medicalCertExpiry: z.string().min(10),
    policeVerification: z.enum(['Verified', 'Pending', 'Expired']),
    joiningDate: z.string().min(10),
    experience: z.number().nonnegative(),
    safetyScore: z.number().min(0).max(100).default(100),
    currentVehicleId: z.string().nullable().optional(),
    status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']).default('Available'),
  }),
});

export const updateDriverSchema = z.object({
  body: createDriverSchema.shape.body.partial().omit({ id: true }),
});

export const updateDriverStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']),
  }),
});
