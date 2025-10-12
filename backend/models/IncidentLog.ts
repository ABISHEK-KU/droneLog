import mongoose, { Schema, Document, model, Types } from "mongoose";

// Define interface for IncidentLog document
export interface IIncident extends Document {
  drone: Types.ObjectId;
  log?: Types.ObjectId;
  title: string;
  description?: string;
  severity?: "low" | "medium" | "high";
  createdBy?: string;
}

// Define schema for IncidentLog document
const IncidentLogSchema = new Schema<IIncident>({
  drone: { type: Schema.Types.ObjectId, ref: "Drone" },
  log: { type: Schema.Types.ObjectId, ref: "Log" },
  title: { type: String, required: true },
  description: { type: String },
  severity: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  createdBy: { type: String },
});

// Create and export the IncidentLog model based on IncidentLog interface and IncidentLogSchema
export const Incident = model<IIncident>("Incident", IncidentLogSchema);

