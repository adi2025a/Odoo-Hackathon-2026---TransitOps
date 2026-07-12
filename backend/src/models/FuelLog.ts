import { Schema, model } from 'mongoose';

export interface IFuelLog {
  _id: string;
  vehicleId: string;
  tripId: string | null;
  driverId: string;
  fuelQuantity: number;
  fuelCost: number;
  station: string;
  date: string;
  odometer: number;
  createdAt: Date;
  updatedAt: Date;
}

const FuelLogSchema = new Schema<IFuelLog>(
  {
    _id: { type: String, required: true },
    vehicleId: { type: String, required: true },
    tripId: { type: String, default: null },
    driverId: { type: String, required: true },
    fuelQuantity: { type: Number, required: true },
    fuelCost: { type: Number, required: true },
    station: { type: String, required: true },
    date: { type: String, required: true },
    odometer: { type: Number, required: true },
  },
  { timestamps: true, _id: false }
);

export const FuelLog = model<IFuelLog>('FuelLog', FuelLogSchema);
export default FuelLog;
