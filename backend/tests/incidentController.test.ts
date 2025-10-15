// Mock modules before imports
jest.mock('../models/IncidentLog');

import { IncidentController } from '../controller/incidentController';
import { Incident } from '../models/IncidentLog';
import mongoose from 'mongoose';

class MockQuery extends Promise<any> {
  populate() {
    return this;
  }
}

describe('IncidentController', () => {
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

  describe('getAllIncidents', () => {
    it('should return all incidents', async () => {
      const mockIncidents = [
        { _id: '1', title: 'Test Incident 1', severity: 'high' },
        { _id: '2', title: 'Test Incident 2', severity: 'medium' }
      ];

      const mockQuery = new MockQuery((resolve) => resolve(mockIncidents));
      (Incident.find as jest.Mock).mockReturnValue(mockQuery);

      await IncidentController.getAllIncidents(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        message: 'Success',
        data: mockIncidents
      });
      expect(Incident.find).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const mockQuery = new MockQuery((resolve, reject) => reject(new Error('Database error')));
      (Incident.find as jest.Mock).mockReturnValue(mockQuery);

      await IncidentController.getAllIncidents(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: false,
        message: 'Database error'
      });
    });
  });

  describe('getIncidentById', () => {
    it('should return incident by id', async () => {
      const mockIncident = { _id: '1', title: 'Test Incident', severity: 'high' };
      mockReq.params = { id: '1' };

      const mockQuery = new MockQuery((resolve) => resolve(mockIncident));
      (Incident.findById as jest.Mock).mockReturnValue(mockQuery);

      await IncidentController.getIncidentById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        message: 'Success',
        data: mockIncident
      });
    });

    it('should return 404 if incident not found', async () => {
      mockReq.params = { id: '1' };

      const mockQuery = new MockQuery((resolve) => resolve(null));
      (Incident.findById as jest.Mock).mockReturnValue(mockQuery);

      await IncidentController.getIncidentById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: false,
        message: 'Incident not found'
      });
    });
  });

  describe('createIncident', () => {
    it('should create a new incident', async () => {
      const newIncidentData = {
        drone: new mongoose.Types.ObjectId(),
        title: 'New Incident',
        description: 'Description',
        severity: 'high'
      };
      mockReq.body = newIncidentData;

      const savedIncident = { _id: '1', ...newIncidentData };

      const mockIncidentInstance = {
        save: jest.fn().mockResolvedValue(savedIncident)
      };

      (Incident as jest.MockedClass<typeof Incident>).mockImplementation(() => mockIncidentInstance as any);

      await IncidentController.createIncident(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        message: 'Incident created successfully',
        data: savedIncident
      });
    });

    it('should handle validation errors', async () => {
      const invalidIncident = { title: '' };
      mockReq.body = invalidIncident;

      const mockIncidentInstance = {
        save: jest.fn().mockRejectedValue(new Error('Validation error'))
      };

      (Incident as jest.MockedClass<typeof Incident>).mockImplementation(() => mockIncidentInstance as any);

      await IncidentController.createIncident(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: false,
        message: 'Validation error'
      });
    });
  });

  describe('updateIncident', () => {
    it('should update an incident', async () => {
      const updateData = { title: 'Updated Title' };
      mockReq.params = { id: '1' };
      mockReq.body = updateData;

      const updatedIncident = { _id: '1', title: 'Updated Title', severity: 'high' };

      const mockQuery = new MockQuery((resolve) => resolve(updatedIncident));
      (Incident.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

      await IncidentController.updateIncident(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        message: 'Incident updated successfully',
        data: updatedIncident
      });
    });

    it('should return 404 if incident not found', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { title: 'Updated' };

      const mockQuery = new MockQuery((resolve) => resolve(null));
      (Incident.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

      await IncidentController.updateIncident(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: false,
        message: 'Incident not found'
      });
    });
  });

  describe('deleteIncident', () => {
    it('should delete an incident', async () => {
      const mockIncident = { _id: '1', title: 'Test Incident' };
      mockReq.params = { id: '1' };

      (Incident.findById as jest.Mock).mockResolvedValue(mockIncident);
      (Incident.findByIdAndDelete as jest.Mock).mockResolvedValue(mockIncident);

      await IncidentController.deleteIncident(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        message: 'Incident deleted successfully'
      });
    });

    it('should return 404 if incident not found', async () => {
      mockReq.params = { id: '1' };

      (Incident.findById as jest.Mock).mockResolvedValue(null);

      await IncidentController.deleteIncident(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: false,
        message: 'Incident not found'
      });
    });
  });
});
