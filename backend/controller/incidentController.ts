// incidentController controller file
import { Request, Response } from 'express';
import { Incident } from '../models/IncidentLog';

export class IncidentController {

  static async getAllIncidents(req: Request, res: Response) {
    try {
      const incidents = await Incident.find().populate('drone').populate('log');
      res.status(200).json({
        responseStatus: true,
        responseMessage: 'Success',
        data: incidents,
      });
    } catch (err: any) {
      res.status(400).json({
        responseStatus: false,
        responseMessage: err.message || 'An error occurred',
      });
    }
  }

  static async getIncidentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const incident = await Incident.findById(id).populate('drone').populate('log');
      if (!incident) {
        return res.status(404).json({
          responseStatus: false,
          responseMessage: 'Incident not found',
        });
      }
      res.status(200).json({
        responseStatus: true,
        responseMessage: 'Success',
        data: incident,
      });
    } catch (err: any) {
      res.status(400).json({
        responseStatus: false,
        responseMessage: err.message || 'An error occurred',
      });
    }
  }

  static async deleteIncident(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const incident = await Incident.findById(id);
      if (!incident) {
        return res.status(404).json({
          responseStatus: false,
          responseMessage: 'Incident not found',
        });
      }
      await Incident.findByIdAndDelete(id);
      res.status(200).json({
        responseStatus: true,
        responseMessage: 'Incident deleted successfully',
      });
    } catch (err: any) {
      res.status(500).json({
        responseStatus: false,
        responseMessage: err.message || 'An error occurred',
      });
    }
  }
}
