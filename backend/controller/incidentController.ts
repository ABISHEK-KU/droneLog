// incidentController controller file
import { Request, Response } from "express";
import { Incident } from "../models/IncidentLog";

export class IncidentController {
  static async getAllIncidents(req: Request, res: Response) {
    try {
      const incidents = await Incident.find().populate("drone").populate("log");
      res.status(200).json({
        status: true,
        message: "Success",
        data: incidents,
      });
    } catch (err: any) {
      res.status(400).json({
        status: false,
        message: err.message || "An error occurred",
      });
    }
  }

  static async getIncidentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const incident = await Incident.findById(id)
        .populate("drone")
        .populate("log");
      if (!incident) {
        return res.status(404).json({
          status: false,
          message: "Incident not found",
        });
      }
      res.status(200).json({
        status: true,
        message: "Success",
        data: incident,
      });
    } catch (err: any) {
      res.status(400).json({
        status: false,
        message: err.message || "An error occurred",
      });
    }
  }

  static async deleteIncident(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const incident = await Incident.findById(id);
      if (!incident) {
        return res.status(404).json({
          status: false,
          message: "Incident not found",
        });
      }
      await Incident.findByIdAndDelete(id);
      res.status(200).json({
        status: true,
        message: "Incident deleted successfully",
      });
    } catch (err: any) {
      res.status(500).json({
        status: false,
        message: err.message || "An error occurred",
      });
    }
  }

  static async createIncident(req: Request, res: Response) {
    try {
      const { drone, log, title, description, severity, createdBy } = req.body;

      const newIncident = new Incident({
        drone,
        log,
        title,
        description,
        severity,
        createdBy,
      });

      const savedIncident = await newIncident.save();
      res.status(201).json({
        status: true,
        message: "Incident created successfully",
        data: savedIncident,
      });
    } catch (err: any) {
      res.status(400).json({
        status: false,
        message: err.message || "An error occurred",
      });
    }
  }

  static async updateIncident(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedIncident = await Incident.findByIdAndUpdate(id, updateData, {
        new: true,
      }).populate("drone").populate("log");

      if (!updatedIncident) {
        return res.status(404).json({
          status: false,
          message: "Incident not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "Incident updated successfully",
        data: updatedIncident,
      });
    } catch (err: any) {
      res.status(400).json({
        status: false,
        message: err.message || "An error occurred",
      });
    }
  }
}
