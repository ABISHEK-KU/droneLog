import request from 'supertest';
import express from 'express';
import { PrePostCheckController } from '../controller/prePostCheckController';
import { PrePostCheck } from '../models/PrePostCheck';
import mongoose from 'mongoose';

// Mock the model
jest.mock('../models/PrePostCheck');

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/prepostchecks', PrePostCheckController.getAllPrePostChecks);
app.get('/prepostchecks/:id', PrePostCheckController.getPrePostCheckById);
app.post('/prepostchecks', PrePostCheckController.createPrePostCheck);
app.put('/prepostchecks/:id', PrePostCheckController.updatePrePostCheck);
app.delete('/prepostchecks/:id', PrePostCheckController.deletePrePostCheck);

describe('PrePostCheckController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('getAllPrePostChecks', () => {
    it('should return all pre/post checks', async () => {
      const mockChecks = [
        { _id: '1', type: 'pre', drone: 'drone1', log: 'log1' },
        { _id: '2', type: 'post', drone: 'drone2', log: 'log2' }
      ];

      const mockPopulate1 = jest.fn();
      const mockPopulate2 = jest.fn();
      (PrePostCheck.find as jest.Mock).mockReturnValue({
        populate: mockPopulate1
      });
      mockPopulate1.mockReturnValue({
        populate: mockPopulate2
      });
      mockPopulate2.mockResolvedValue(mockChecks);

      const response = await request(app).get('/prepostchecks');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('Success');
      expect(response.body.data).toEqual(mockChecks);
    });

    it('should handle errors', async () => {
      const mockPopulate1 = jest.fn();
      const mockPopulate2 = jest.fn();
      (PrePostCheck.find as jest.Mock).mockReturnValue({
        populate: mockPopulate1
      });
      mockPopulate1.mockReturnValue({
        populate: mockPopulate2
      });
      mockPopulate2.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/prepostchecks');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
    });
  });

  describe('getPrePostCheckById', () => {
    it('should return pre/post check by id', async () => {
      const mockCheck = { _id: '1', type: 'pre', drone: 'drone1', log: 'log1' };

      const mockPopulate1 = jest.fn();
      const mockPopulate2 = jest.fn();
      (PrePostCheck.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate1
      });
      mockPopulate1.mockReturnValue({
        populate: mockPopulate2
      });
      mockPopulate2.mockResolvedValue(mockCheck);

      const response = await request(app).get('/prepostchecks/1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('Success');
      expect(response.body.data).toEqual(mockCheck);
    });

    it('should return 404 if pre/post check not found', async () => {
      const mockPopulate1 = jest.fn();
      const mockPopulate2 = jest.fn();
      (PrePostCheck.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate1
      });
      mockPopulate1.mockReturnValue({
        populate: mockPopulate2
      });
      mockPopulate2.mockResolvedValue(null);

      const response = await request(app).get('/prepostchecks/1');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('PrePostCheck not found');
    });
  });

  describe('createPrePostCheck', () => {
    it('should create a new pre/post check', async () => {
      const newCheck = {
        drone: new mongoose.Types.ObjectId(),
        log: new mongoose.Types.ObjectId(),
        type: 'pre',
        items: [{ name: 'Check 1', ok: true, notes: 'Good' }],
        performedBy: 'user1'
      };
      const savedCheck = { _id: '1', ...newCheck };

      const MockPrePostCheck = PrePostCheck as jest.MockedClass<typeof PrePostCheck>;
      MockPrePostCheck.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedCheck)
      } as any));

      const response = await request(app)
        .post('/prepostchecks')
        .send(newCheck);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('PrePostCheck created successfully');
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.drone.toString()).toBe(newCheck.drone.toString());
      expect(response.body.data.log.toString()).toBe(newCheck.log.toString());
      expect(response.body.data.type).toBe(newCheck.type);
      expect(response.body.data.items).toEqual(newCheck.items);
      expect(response.body.data.performedBy).toBe(newCheck.performedBy);
    });

    it('should handle validation errors', async () => {
      const invalidCheck = { type: 'invalid' }; // Missing required fields

      const MockPrePostCheck = PrePostCheck as jest.MockedClass<typeof PrePostCheck>;
      MockPrePostCheck.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Validation error'))
      } as any));

      const response = await request(app)
        .post('/prepostchecks')
        .send(invalidCheck);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
    });
  });

  describe('updatePrePostCheck', () => {
    it('should update a pre/post check', async () => {
      const updateData = { performedBy: 'Updated User' };
      const updatedCheck = { _id: '1', type: 'pre', performedBy: 'Updated User' };

      const mockPopulate1 = jest.fn();
      const mockPopulate2 = jest.fn();
      (PrePostCheck.findByIdAndUpdate as jest.Mock).mockReturnValue({
        populate: mockPopulate1
      });
      mockPopulate1.mockReturnValue({
        populate: mockPopulate2
      });
      mockPopulate2.mockResolvedValue(updatedCheck);

      const response = await request(app)
        .put('/prepostchecks/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('PrePostCheck updated successfully');
      expect(response.body.data).toEqual(updatedCheck);
    });

    it('should return 404 if pre/post check not found', async () => {
      const mockPopulate1 = jest.fn();
      const mockPopulate2 = jest.fn();
      (PrePostCheck.findByIdAndUpdate as jest.Mock).mockReturnValue({
        populate: mockPopulate1
      });
      mockPopulate1.mockReturnValue({
        populate: mockPopulate2
      });
      mockPopulate2.mockResolvedValue(null);

      const response = await request(app)
        .put('/prepostchecks/1')
        .send({ performedBy: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(false);
    });
  });

  describe('deletePrePostCheck', () => {
    it('should delete a pre/post check', async () => {
      const mockCheck = { _id: '1', type: 'pre' };

      (PrePostCheck.findById as jest.Mock).mockResolvedValue(mockCheck);
      (PrePostCheck.findByIdAndDelete as jest.Mock).mockResolvedValue(mockCheck);

      const response = await request(app).delete('/prepostchecks/1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('PrePostCheck deleted successfully');
    });

    it('should return 404 if pre/post check not found', async () => {
      (PrePostCheck.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete('/prepostchecks/1');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(false);
    });
  });
});
