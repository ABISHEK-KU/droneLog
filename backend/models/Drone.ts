import mongoose, { Schema, Document, model } from 'mongoose';

// Define interface for Drone document
export interface IDrone extends Document {
    name:string;
    modelName:string;
    serial:string;
    createdAt: Date;
}

// Define schema for Drone document
const DroneSchema = new Schema<IDrone>({
  name:String,
  modelName:String,
  serial: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

// Create and export the Drone model based on Drone interface and DroneSchema
export const Drone = model<IDrone>("Drone", DroneSchema);