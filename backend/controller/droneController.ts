// droneController controller file
import { Request, Response } from "express";
import { Drone } from "../models/Drone";
import { Incident } from "../models/IncidentLog";
import { Log } from "../models/Log";
import { PrePostCheck } from "../models/PrePostCheck";

export class DroneController {
  static async addNewDrone(req: Request, res: Response) {
    try {
      const { name, modelName, serial } = req.body;
      if (!name || !modelName || !serial) {
        return res.status(400).json({
          status: false,
          message: "Name, model, and serial are required",
        });
      }
      const newDrone = new Drone({ name, modelName, serial });
      const savedDrone = await newDrone.save();
      res.status(201).json({
        status: true,
        message: "Drone added successfully",
        data: savedDrone,
      });
    } catch (err: any) {
      res.status(500).json({
        status: false,
        message: err.message || "An error occurred",
      });
    }
  }

  static async editDrone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const drone = await Drone.findByIdAndUpdate(id, updates, { new: true });
      if (!drone) {
        return res.status(404).json({
          status: false,
          message: "Drone not found",
        });
      }
      res.status(200).json({
        status: true,
        message: "Drone updated successfully",
        data: drone,
      });
    } catch (err: any) {
      res.status(500).json({
        status: false,
        message: err.message || "An error occurred",
      });
    }
  }

  static async getAllDrone(req: Request, res: Response) {
    try {
      const drones = await Drone.find();
      res.status(200).json({
        status: true,
        message: "Drones retrieved successfully",
        data: drones,
      });
    } catch (err: any) {
      res.status(500).json({
        status: false,
        message: "An error occurred while getting data from database",
      });
    }
  }

  static async deleteDrone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const drone = await Drone.findByIdAndDelete(id);
      if (!drone) {
        return res.status(404).json({
          status: false,
          message: "Drone not found",
        });
      }

      // Delete all related logs
      await Log.deleteMany({ drone: id });

      // Delete all related incidents
      await Incident.deleteMany({ drone: id });

      // Delete all related pre/post checks
      await PrePostCheck.deleteMany({ drone: id });

      res.status(200).json({
        status: true,
        message: "Drone and all associated data deleted successfully",
      });
    } catch (err: any) {
      res.status(500).json({
        status: false,
        message: err.message || "An error occurred",
      });
    }
  }
}
