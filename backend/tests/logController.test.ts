import request from 'supertest';
import express from 'express';
import { LogController } from '../controller/logController';
import { Log } from '../models/Log';
import { PrePostCheck } from '../models/PrePostCheck';
import mongoose from 'mongoose';
import fs from 'fs';

// Mock the models and fs
jest.mock('../models/Log');
jest.mock('../models/PrePostCheck');
jest.mock('fs');

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/logs', LogController.getAllLogs);
app.get('/logs/:id', LogController.getLogById);
app.delete('/logs/:id', LogController.deleteLogById);

describe('LogController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('getAllLogs', () => {
    it('should return all logs', async () => {
      const mockLogs = [
        { _id: '1', filename: 'log1.tlog', drone: 'drone1' },
        { _id: '2', filename: 'log2.tlog', drone: 'drone2' }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockQuery.populate.mockResolvedValue(mockLogs);
      (Log.find as jest.Mock).mockReturnValue(mockQuery);

      const response = await request(app).get('/logs');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('Success');
      expect(response.body.data).toEqual(mockLogs);
    });

    it('should handle errors', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockQuery.populate.mockRejectedValue(new Error('Database error'));
      (Log.find as jest.Mock).mockReturnValue(mockQuery);

      const response = await request(app).get('/logs');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
    });
  });

  describe('getLogById', () => {
    it('should return log by id', async () => {
      const mockLog = { _id: '1', filename: 'log1.tlog', drone: 'drone1' };

      const mockQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockQuery.populate.mockResolvedValue(mockLog);
      (Log.findById as jest.Mock).mockReturnValue(mockQuery);

      const response = await request(app).get('/logs/1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('Success');
      expect(response.body.data).toEqual(mockLog);
    });

    it('should return 404 if log not found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockQuery.populate.mockResolvedValue(null);
      (Log.findById as jest.Mock).mockReturnValue(mockQuery);

      const response = await request(app).get('/logs/1');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('Log not found');
    });
  });

  describe('deleteLogById', () => {
    it('should delete a log and associated prePostChecks successfully', async () => {
      const mockLog = { _id: '1', filename: 'log1.tlog', path: '/path/to/log1.tlog' };

      (Log.findById as jest.Mock).mockResolvedValue(mockLog);
      (PrePostCheck.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 2 });
      (Log.findByIdAndDelete as jest.Mock).mockResolvedValue(mockLog);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

      const response = await request(app).delete('/logs/1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('Log deleted successfully');
      expect(Log.findById).toHaveBeenCalledWith('1');
      expect(PrePostCheck.deleteMany).toHaveBeenCalledWith({ log: '1' });
      expect(fs.unlinkSync).toHaveBeenCalledWith('D:\\Projects\\droneLog\\backend\\path\\to\\log1.tlog');
      expect(Log.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should return 404 if log not found', async () => {
      (Log.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete('/logs/1');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('Log not found');
    });

    it('should handle file deletion errors gracefully', async () => {
      const mockLog = { _id: '1', filename: 'log1.tlog', path: '/path/to/log1.tlog' };

      (Log.findById as jest.Mock).mockResolvedValue(mockLog);
      (PrePostCheck.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 0 });
      (Log.findByIdAndDelete as jest.Mock).mockResolvedValue(mockLog);
      (fs.existsSync as jest.Mock).mockReturnValue(false); // File doesn't exist

      const response = await request(app).delete('/logs/1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('Log deleted successfully');
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });
});
