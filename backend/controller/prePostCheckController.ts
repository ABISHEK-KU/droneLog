// prePostCheckController controller file
import { Request, Response } from "express";
import { PrePostCheck } from "../models/PrePostCheck";

export class PrePostCheckController {
  static async getAllPrePostChecks(req: Request, res: Response) {
    try {
      const checks = await PrePostCheck.find().populate("drone").populate("log");
      res.status(200).json({
        status: true,
        message: "Success",
        data: checks,
      });
    } catch (err: any) {
      res.status(400).json({
        status: false,
        message: err.message || "An error occurred",
      });
    }
  }

  static async getPrePostCheckById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const check = await PrePostCheck.findById(id).populate("drone").populate("log");
      if (!check) {
        return res.status(404).json({
          status: false,
          message: "PrePostCheck not found",
        });
      }
      res.status(200).json({
        status: true,
        message: "Success",
        data: check,
      });
    } catch (err: any) {
      res.status(400).json({
        status: false,
        message: err.message || "An error occurred",
      });
    }
  }

  static async createPrePostCheck(req: Request, res: Response) {
    try {
      const { drone, log, type, items, performedBy } = req.body;

      const newCheck = new PrePostCheck({
        drone,
        log,
        type,
        items,
        performedBy,
      });

      const savedCheck = await newCheck.save();
      res.status(201).json({
        status: true,
        message: "PrePostCheck created successfully",
        data: savedCheck,
      });
    } catch (err: any) {
      res.status(400).json({
        status: false,
        message: err.message || "An error occurred",
      });
    }
  }

  static async updatePrePostCheck(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedCheck = await PrePostCheck.findByIdAndUpdate(id, updateData, {
        new: true,
      }).populate("drone").populate("log");

      if (!updatedCheck) {
        return res.status(404).json({
          status: false,
          message: "PrePostCheck not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "PrePostCheck updated successfully",
        data: updatedCheck,
      });
    } catch (err: any) {
      res.status(400).json({
        status: false,
        message: err.message || "An error occurred",
      });
    }
  }

  static async deletePrePostCheck(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const check = await PrePostCheck.findById(id);
      if (!check) {
        return res.status(404).json({
          status: false,
          message: "PrePostCheck not found",
        });
      }
      await PrePostCheck.findByIdAndDelete(id);
      res.status(200).json({
        status: true,
        message: "PrePostCheck deleted successfully",
      });
    } catch (err: any) {
      res.status(500).json({
        status: false,
        message: err.message || "An error occurred",
      });
    }
  }
}
