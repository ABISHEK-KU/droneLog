// Mock modules before imports
jest.mock('../models/Drone');
jest.mock('../models/Log');
jest.mock('../models/IncidentLog');
jest.mock('../models/PrePostCheck');
jest.mock('fs');
jest.mock('path');
jest.mock('../utils/logParser');

import { LogUploadController } from '../controller/logUploadController';
import { Drone } from '../models/Drone';
import { Log } from '../models/Log';
import { Incident } from '../models/IncidentLog';
import { PrePostCheck } from '../models/PrePostCheck';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { parseTlog } from '../utils/logParser';

describe('LogUploadController', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('logUploadController', () => {
    it('should upload and process a log file successfully', async () => {
      mockReq.file = {
        originalname: 'test.tlog',
        filename: 'uploaded_file',
        path: '/uploads/uploaded_file',
        size: 1024
      };
      mockReq.body = { droneId: 'drone1' };

      const mockDrone = { _id: 'drone1', name: 'Drone1' };
      const mockLog = {
        _id: 'log1',
        drone: mockDrone._id,
        filename: 'test.tlog',
        path: '/uploads/uploaded_file.tlog',
        size: 1024,
        save: jest.fn().mockResolvedValue(undefined)
      };

      // Mock dependencies
      (Drone.findById as jest.Mock).mockResolvedValue(mockDrone);
      (Log.create as jest.Mock).mockResolvedValue(mockLog);
      (fs.renameSync as jest.Mock).mockImplementation(() => {});
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('mock tlog data'));
      // Mock parseTlog to return parsed data
      const mockParsedData = {
        summary: {
          startTime: new Date(),
          endTime: new Date(),
          durationSeconds: 100,
          gpsTrack: [{ lat: 10, lon: 20 }],
          incidents: [{ title: 'Test Incident', description: 'Test', severity: 'high' }],
          messageCount: 100
        }
      };
      (parseTlog as jest.Mock).mockResolvedValue(mockParsedData);

      // Mock Incident.create and PrePostCheck.create
      (Incident.create as jest.Mock).mockResolvedValue({ _id: 'incident1' });
      (PrePostCheck.create as jest.Mock).mockResolvedValue({ _id: 'check1' });

      await LogUploadController.logUploadController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        message: 'Success'
      });
      expect(Drone.findById).toHaveBeenCalledWith('drone1');
      expect(Log.create).toHaveBeenCalled();
    });

    it('should return 400 if no file uploaded', async () => {
      mockReq.file = undefined;
      mockReq.body = { droneId: 'drone1' };

      await LogUploadController.logUploadController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No file uploaded' });
    });

    it('should return 400 if drone not found', async () => {
      mockReq.file = {
        originalname: 'test.tlog',
        filename: 'uploaded_file',
        path: '/uploads/uploaded_file',
        size: 1024
      };
      mockReq.body = { droneId: 'invalid' };

      (Drone.findById as jest.Mock).mockResolvedValue(null);

      await LogUploadController.logUploadController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Drone not found' });
    });

    it('should return 400 for unsupported file type', async () => {
      mockReq.file = {
        originalname: 'test.txt',
        filename: 'uploaded_file',
        path: '/uploads/uploaded_file',
        size: 1024
      };
      mockReq.body = { droneId: 'drone1' };

      const mockDrone = { _id: 'drone1', name: 'Drone1' };
      (Drone.findById as jest.Mock).mockResolvedValue(mockDrone);

      await LogUploadController.logUploadController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: false,
        message: 'Unsupported file type. Please provide a .tlog file.'
      });
    });

    it('should handle parsing errors', async () => {
      mockReq.file = {
        originalname: 'test.tlog',
        filename: 'uploaded_file',
        path: '/uploads/uploaded_file',
        size: 1024
      };
      mockReq.body = { droneId: 'drone1' };

      const mockDrone = { _id: 'drone1', name: 'Drone1' };
      (Drone.findById as jest.Mock).mockResolvedValue(mockDrone);
      (fs.renameSync as jest.Mock).mockImplementation(() => {});
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('mock tlog data'));
      // Mock parseTlog to throw error
      (parseTlog as jest.Mock).mockRejectedValue(new Error('Parsing failed'));

      await LogUploadController.logUploadController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: false,
        message: 'Parsing failed'
      });
    });
  });
});
