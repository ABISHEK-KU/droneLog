import mongoose, { Schema, Document, model, Types } from "mongoose";

// Define interface for PrePostCheck document
export interface IPrePostCheck extends Document {
  drone: Types.ObjectId;
  log: Types.ObjectId;
  type: "pre" | "post";
  items: Array<{ name: string; ok: boolean; notes?: string }>;
  performedBy?: string;
}

// Define schema for PrePostCheck document
const PrePostCheckSchema: Schema = new Schema(
  {
    drone: { type: Schema.Types.ObjectId, ref: "Drone" },
    log: { type: Schema.Types.ObjectId, ref: "Log", required: true },
    type: { type: String, enum: ["pre", "post"], required: true },
    items: { type: [Schema.Types.Mixed], default: [] },
    performedBy: { type: String },
  },
  { timestamps: true }
);

// Create and export the PrePostCheck model based on PrePostCheck interface and PrePostCheckSchema
export const PrePostCheck = model<IPrePostCheck>(
  `PrePostCheck`,
  PrePostCheckSchema
);
