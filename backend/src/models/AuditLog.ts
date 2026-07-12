import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: Date;
  ipAddress?: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: String, required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
  }
);

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
