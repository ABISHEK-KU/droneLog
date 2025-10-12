// logController controller file
import { Request, Response } from 'express';
import Log from '../models/Log';
import { PrePostCheck } from '../models/PrePostCheck';
import fs from "fs";
import path from 'path';

export class LogController {

  static async getAllLogs (req: Request, res: Response) {
    try {
      const logs = await Log.find().populate('drone');
      res.status(200).json({
        responseStatus: true,
        responseMessage: 'Success',
        data: logs,
      });
    } catch (err: any) {
      // Specify 'err: any' to handle the unknown type
      res.status(400).json({
        responseStatus: false,
        responseMessage: err.message || 'An error occurred',
      });
    }
  }

  static async getLogById (req: Request, res: Response) {
    try {
      const { id } = req.params;
      const log = await Log.findById(id).populate('drone');
      if (!log) {
        return res.status(404).json({
          responseStatus: false,
          responseMessage: 'Log not found',
        });
      }
      res.status(200).json({
        responseStatus: true,
        responseMessage: 'Success',
        data: log,
      });
    } catch (err: any) {
      // Specify 'err: any' to handle the unknown type
      res.status(400).json({
        responseStatus: false,
        responseMessage: err.message || 'An error occurred',
      });
    }
  }

  static async deleteLogById (req: Request, res: Response) {
    try {
      const { id } = req.params;
      const log = await Log.findById(id);
      if (!log) {
        return res.status(404).json({
          responseStatus: false,
          responseMessage: 'Log not found',
        });
      }
      // Delete associated PrePostChecks
      await PrePostCheck.deleteMany({ log: id });

      // Delete the log file from the filesystem
      const filePath = path.join(__dirname, '..', log.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      // Delete the log document from the database
      await Log.findByIdAndDelete(id);
      res.status(200).json({
        responseStatus: true,
        responseMessage: 'Log deleted successfully',
      });
    } catch (err: any) {
      res.status(500).json({
        responseStatus: false,
        responseMessage: err.message || 'An error occurred',
      });
    }
  }
}
