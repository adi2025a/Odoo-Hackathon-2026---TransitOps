import { Schema, model } from 'mongoose';

export interface IDriver {
  _id: string;
  name: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  licenseNumber: string;
  licenseCategory: 'Class A CDL' | 'Class B CDL' | 'Class C';
  licenseExpiry: string;
  medicalCertExpiry: string;
  policeVerification: 'Verified' | 'Pending' | 'Expired';
  joiningDate: string;
  experience: number;
  safetyScore: number;
  currentVehicleId: string | null;
  status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    dob: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    address: { type: String, required: true },
    emergencyContact: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseCategory: { type: String, enum: ['Class A CDL', 'Class B CDL', 'Class C'], required: true },
    licenseExpiry: { type: String, required: true },
    medicalCertExpiry: { type: String, required: true },
    policeVerification: { type: String, enum: ['Verified', 'Pending', 'Expired'], required: true },
    joiningDate: { type: String, required: true },
    experience: { type: Number, required: true },
    safetyScore: { type: Number, required: true, min: 0, max: 100 },
    currentVehicleId: { type: String, default: null },
    status: { type: String, enum: ['Available', 'On Trip', 'Off Duty', 'Suspended'], required: true },
  },
  { timestamps: true, _id: false }
);

export const Driver = model<IDriver>('Driver', DriverSchema);
export default Driver;
