import mongoose, { Schema, Document } from 'mongoose';
import { IDrone } from './Drone';

// Define interface for Log document
export interface ILog extends Document {
  drone: IDrone;
  filename: string;
  path: string;
  size: number;
  startTime?: Date;
  endTime?: Date;
  durationSeconds?: number;
  gpsTrack?: Array<{ lat: number; lon: number; alt?: number; ts?: number }>;
  messagesCount?: number;
  parsedSummary?: Record<string, any>;
  raw?: boolean;
}

// Define schema for Log document
const LogSchema= new Schema<ILog>(
  {
    drone: { type: Schema.Types.ObjectId, ref: "Drone" },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number },
    endTime: { type: Date },
    durationSeconds: { type: Number },
    gpsTrack: { type: [Schema.Types.Mixed] },
    messagesCount: { type: Number },
    parsedSummary: { type: Schema.Types.Mixed },
    raw: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Create and export the Log model based on Log interface and LogSchema
export default mongoose.model<ILog & Document>(`Log`, LogSchema);