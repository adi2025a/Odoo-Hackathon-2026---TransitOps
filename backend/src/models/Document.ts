import { Schema, model } from 'mongoose';

export interface IDocument {
  _id: string;
  name: string;
  category: 'VEHICLE' | 'DRIVER' | 'COMPLIANCE' | 'FINANCIAL' | 'OTHER';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  vehicleId?: string | null;
  driverId?: string | null;
  uploadedBy: string;
  expiryDate?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['VEHICLE', 'DRIVER', 'COMPLIANCE', 'FINANCIAL', 'OTHER'],
      required: true,
    },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    vehicleId: { type: String, default: null },
    driverId: { type: String, default: null },
    uploadedBy: { type: String, required: true },
    expiryDate: { type: String, default: null },
  },
  { timestamps: true, _id: false }
);

export const DocumentModel = model<IDocument>('Document', DocumentSchema);
export default DocumentModel;
