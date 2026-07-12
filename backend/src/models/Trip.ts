import { Schema, model } from 'mongoose';

export interface ITripEvent {
  time: string;
  title: string;
  description: string;
}

export interface ITripCompletionData {
  finalOdometer: number;
  fuelUsed: number;
  expenses: number;
  deliveryProof: string;
  remarks: string;
  completedAt: string;
}

export interface ITrip {
  _id: string;
  source: string;
  destination: string;
  stops: string[];
  distance: number;
  eta: string;
  cargoType: 'Electronics' | 'Perishable Foods' | 'Automotive' | 'Chemicals' | 'General Freight' | 'Pharmaceuticals';
  cargoWeight: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  vehicleId: string;
  driverId: string;
  status: 'Draft' | 'Pending' | 'Dispatched' | 'On Trip' | 'Completed' | 'Cancelled';
  remarks: string;
  timeline: ITripEvent[];
  completionData?: ITripCompletionData;
  createdAt: Date;
  updatedAt: Date;
}

const TripEventSchema = new Schema<ITripEvent>({
  time: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
}, { _id: false });

const TripCompletionDataSchema = new Schema<ITripCompletionData>({
  finalOdometer: { type: Number, required: true },
  fuelUsed: { type: Number, required: true },
  expenses: { type: Number, required: true },
  deliveryProof: { type: String, required: true },
  remarks: { type: String, required: true },
  completedAt: { type: String, required: true },
}, { _id: false });

const TripSchema = new Schema<ITrip>(
  {
    _id: { type: String, required: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    stops: [{ type: String }],
    distance: { type: Number, required: true },
    eta: { type: String, required: true },
    cargoType: {
      type: String,
      enum: ['Electronics', 'Perishable Foods', 'Automotive', 'Chemicals', 'General Freight', 'Pharmaceuticals'],
      required: true,
    },
    cargoWeight: { type: Number, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
    vehicleId: { type: String, required: true },
    driverId: { type: String, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Pending', 'Dispatched', 'On Trip', 'Completed', 'Cancelled'],
      required: true,
    },
    remarks: { type: String, default: '' },
    timeline: [TripEventSchema],
    completionData: { type: TripCompletionDataSchema },
  },
  { timestamps: true, _id: false }
);

export const Trip = model<ITrip>('Trip', TripSchema);
export default Trip;
