import { Schema, model } from 'mongoose';

export interface IMaintenanceRecord {
  _id: string;
  vehicleId: string;
  type: 'Oil Change' | 'Tyre' | 'Brake' | 'Engine' | 'Battery' | 'Inspection';
  status: 'Scheduled' | 'Active' | 'Completed';
  cost: number;
  startDate: string;
  endDate: string | null;
  odometer: number;
  mechanicDetails: string;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceRecordSchema = new Schema<IMaintenanceRecord>(
  {
    _id: { type: String, required: true },
    vehicleId: { type: String, required: true },
    type: {
      type: String,
      enum: ['Oil Change', 'Tyre', 'Brake', 'Engine', 'Battery', 'Inspection'],
      required: true,
    },
    status: { type: String, enum: ['Scheduled', 'Active', 'Completed'], required: true },
    cost: { type: Number, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, default: null },
    odometer: { type: Number, required: true },
    mechanicDetails: { type: String, required: true },
    remarks: { type: String, default: '' },
  },
  { timestamps: true, _id: false }
);

export const MaintenanceRecord = model<IMaintenanceRecord>('MaintenanceRecord', MaintenanceRecordSchema);
export default MaintenanceRecord;
