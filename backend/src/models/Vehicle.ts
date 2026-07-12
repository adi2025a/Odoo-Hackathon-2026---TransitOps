import { Schema, model } from 'mongoose';

export interface IVehicle {
  _id: string;
  regNumber: string;
  name: string;
  model: string;
  type: string;
  manufacturer: string;
  year: number;
  vin: string;
  fuelType: 'Diesel' | 'Electric' | 'Gasoline' | 'CNG';
  loadCapacity: number;
  odometer: number;
  purchaseCost: number;
  insuranceExpiry: string;
  fitnessExpiry: string;
  pucExpiry: string;
  status: 'Available' | 'On Trip' | 'Maintenance' | 'Retired';
  region: 'North' | 'South' | 'East' | 'West' | 'Central';
  assignedDriverId: string | null;
  photoColor: string;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    _id: { type: String, required: true },
    regNumber: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    model: { type: String, required: true },
    type: { type: String, required: true },
    manufacturer: { type: String, required: true },
    year: { type: Number, required: true },
    vin: { type: String, required: true, unique: true },
    fuelType: { type: String, enum: ['Diesel', 'Electric', 'Gasoline', 'CNG'], required: true },
    loadCapacity: { type: Number, required: true },
    odometer: { type: Number, required: true },
    purchaseCost: { type: Number, required: true },
    insuranceExpiry: { type: String, required: true },
    fitnessExpiry: { type: String, required: true },
    pucExpiry: { type: String, required: true },
    status: { type: String, enum: ['Available', 'On Trip', 'Maintenance', 'Retired'], required: true },
    region: { type: String, enum: ['North', 'South', 'East', 'West', 'Central'], required: true },
    assignedDriverId: { type: String, default: null },
    photoColor: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

export const Vehicle = model<IVehicle>('Vehicle', VehicleSchema);
export default Vehicle;
