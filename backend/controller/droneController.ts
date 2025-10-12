// droneController controller file
import { Request, Response } from "express";
import { Drone } from "../models/Drone";

export class DroneController {
  static async addNewDrone(req: Request, res: Response) {
    try {
      const { name, model, serial } = req.body;
      if (!name || !model || !serial) {
        return res.status(400).json({
          responseStatus: false,
          responseMessage: "Name, model, and serial are required",
        });
      }
      const newDrone = new Drone({ name, model, serial });
      await newDrone.save();
      res.status(201).json({
        responseStatus: true,
        responseMessage: "Drone added successfully",
        data: newDrone,
      });
    } catch (err: any) {
      res.status(500).json({
        responseStatus: false,
        responseMessage: err.message || "An error occurred",
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
          responseStatus: false,
          responseMessage: "Drone not found",
        });
      }
      res.status(200).json({
        responseStatus: true,
        responseMessage: "Drone updated successfully",
        data: drone,
      });
    } catch (err: any) {
      res.status(500).json({
        responseStatus: false,
        responseMessage: err.message || "An error occurred",
      });
    }
  }

  static async getAllDrone(req: Request, res: Response) {
    try {
      const drones = await Drone.find();
      res.status(200).json({
        responseStatus: true,
        responseMessage: "Drones retrieved successfully",
        data: drones,
      });
    } catch (err: any) {
      res.status(500).json({
        responseStatus: false,
        responseMessage: err.message || "An error occurred",
      });
    }
  }
}
