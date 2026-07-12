import { Schema, model } from 'mongoose';

export interface INotification {
  _id: string;
  userId: string | null;
  type: 'Maintenance Due' | 'License Expiry' | 'Trip Assigned' | 'Trip Completed' | 'High Fuel Usage' | 'Alert';
  title: string;
  message: string;
  date: string;
  read: boolean;
  severity: 'info' | 'warning' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    _id: { type: String, required: true },
    userId: { type: String, default: null },
    type: {
      type: String,
      enum: ['Maintenance Due', 'License Expiry', 'Trip Assigned', 'Trip Completed', 'High Fuel Usage', 'Alert'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: String, required: true },
    read: { type: Boolean, default: false },
    severity: { type: String, enum: ['info', 'warning', 'critical'], required: true },
  },
  { timestamps: true, _id: false }
);

export const Notification = model<INotification>('Notification', NotificationSchema);
export default Notification;
