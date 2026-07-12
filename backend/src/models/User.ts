import { Schema, model, Document } from 'mongoose';

// User does NOT use a custom string _id, so it can extend Document normally
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Fleet Manager' | 'Dispatcher' | 'Driver' | 'Safety Officer' | 'Financial Analyst';
  avatar: string;
  driverId?: string;
  isActive: boolean;
  refreshToken?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  rememberMe: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['Super Admin', 'Fleet Manager', 'Dispatcher', 'Driver', 'Safety Officer', 'Financial Analyst'],
      required: true,
    },
    avatar: { type: String, default: '' },
    driverId: { type: String },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    rememberMe: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
export default User;
