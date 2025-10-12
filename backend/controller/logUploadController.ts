// logUploadController controller file
import { Request, Response } from 'express';
import { Drone } from '../models/Drone';
import Log from '../models/Log';
import { Incident } from '../models/IncidentLog';
import { parseTlog } from '../utils/logParser';

export class LogUploadController {

  static async logUploadController(req: Request, res: Response) {
    try {
        const file = req?.file;
        const { droneId } = req?.body;

        if (!file) return res.status(400).json({ error: "No file uploaded" });
        if (!droneId) return res.status(400).json({ error: "Drone Id Required" });

        const drone = await Drone.findById(droneId);
        if (!drone) return res.status(400).json({ error: "Drone not found" });

        const log = await Log.create({
            drone: drone._id,
            filename: file.originalname,
            path: file.path,
            size: file.size,
        });

        const parsed = await parseTlog(file.path);

        if (parsed) {
          // Populate additional fields from parsed data
          log.startTime = parsed.summary.startTime;
          log.endTime = parsed.summary.endTime;
          log.durationSeconds = parsed.summary.durationSeconds;
          log.gpsTrack = parsed.summary.gpsTrack;
          log.messagesCount = parsed.summary.messageCount;
          log.parsedSummary = parsed.summary;
          log.raw = false; // Mark as parsed

          // Create incidents from parsed data
          if (parsed.summary.incidents && parsed.summary.incidents.length > 0) {
            const incidentPromises = parsed.summary.incidents.map((incidentData: any) =>
              Incident.create({
                drone: drone._id, 
                log: log._id,
                title: incidentData.title,
                description: incidentData.description,
                severity: incidentData.severity,
                createdBy: 'system', // or from req.user if available
              })
            );
            await Promise.all(incidentPromises);
          }

          // Create pre-flight check from parsed data (assuming pre-check based on log start)
          const { PrePostCheck } = require('../models/PrePostCheck');
          const preCheckItems = [
            { name: 'Battery Level', ok: true, notes: 'Checked from log data' },
            { name: 'GPS Signal', ok: parsed.summary.gpsTrack && parsed.summary.gpsTrack.length > 0, notes: 'GPS track available' },
            { name: 'No Incidents Detected', ok: !parsed.summary.incidents || parsed.summary.incidents.length === 0, notes: 'Pre-flight check' },
          ];
          await PrePostCheck.create({
            drone: drone._id,
            log: log._id,
            type: 'pre',
            items: preCheckItems,
            performedBy: 'system',
          });

          // Create post-flight check
          const postCheckItems = [
            { name: 'Flight Duration', ok: (parsed.summary.durationSeconds || 0) > 0, notes: `Duration: ${parsed.summary.durationSeconds || 0}s` },
            { name: 'GPS Track Recorded', ok: parsed.summary.gpsTrack && parsed.summary.gpsTrack.length > 0, notes: 'Track available' },
            { name: 'Incidents Logged', ok: true, notes: `${parsed.summary.incidents ? parsed.summary.incidents.length : 0} incidents detected` },
          ];
          await PrePostCheck.create({
            drone: drone._id,
            log: log._id,
            type: 'post',
            items: postCheckItems,
            performedBy: 'system',
          });
        }

        await log.save(); // Save the updated log

        res.status(200).json({
          responseStatus: true,
          responseMessage: 'Success',
        });
    } catch (err: any) {
      // Specify 'err: any' to handle the unknown type
      res.status(400).json({
        responseStatus: false,
        responseMessage: err.message || 'An error occurred',
      });
    }
  }
}
