// prePostCheckController controller file
import { Request, Response } from 'express';
import { PrePostCheck } from '../models/PrePostCheck';

export class PrePostCheckController {

  static async getAllPrePostChecks(req: Request, res: Response) {
    try {
      const checks = await PrePostCheck.find().populate('drone');
      res.status(200).json({
        responseStatus: true,
        responseMessage: 'Success',
        data: checks,
      });
    } catch (err: any) {
      res.status(400).json({
        responseStatus: false,
        responseMessage: err.message || 'An error occurred',
      });
    }
  }

  static async getPrePostCheckById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const check = await PrePostCheck.findById(id).populate('drone');
      if (!check) {
        return res.status(404).json({
          responseStatus: false,
          responseMessage: 'PrePostCheck not found',
        });
      }
      res.status(200).json({
        responseStatus: true,
        responseMessage: 'Success',
        data: check,
      });
    } catch (err: any) {
      res.status(400).json({
        responseStatus: false,
        responseMessage: err.message || 'An error occurred',
      });
    }
  }
}
