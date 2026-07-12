import { Schema, model } from 'mongoose';

export interface IExpense {
  _id: string;
  vehicleId: string;
  category: 'Fuel' | 'Repair' | 'Maintenance' | 'Insurance' | 'Parking' | 'Toll' | 'Tax' | 'Miscellaneous';
  amount: number;
  date: string;
  description: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    _id: { type: String, required: true },
    vehicleId: { type: String, required: true },
    category: {
      type: String,
      enum: ['Fuel', 'Repair', 'Maintenance', 'Insurance', 'Parking', 'Toll', 'Tax', 'Miscellaneous'],
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Approved', 'Pending', 'Rejected'], default: 'Pending' },
  },
  { timestamps: true, _id: false }
);

export const Expense = model<IExpense>('Expense', ExpenseSchema);
export default Expense;
