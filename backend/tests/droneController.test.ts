import request from 'supertest';
import express from 'express';
import { DroneController } from '../controller/droneController';
import { Drone } from '../models/Drone';
import { Incident } from '../models/IncidentLog';
import { Log } from '../models/Log';
import { PrePostCheck } from '../models/PrePostCheck';
import mongoose from 'mongoose';

// Mock the models
jest.mock('../models/Drone');
jest.mock('../models/IncidentLog');
jest.mock('../models/Log');
jest.mock('../models/PrePostCheck');

const app = express();
app.use(express.json());

// Mock routes for testing
app.post('/drones/add', DroneController.addNewDrone);
app.put('/drones/edit/:id', DroneController.editDrone);
app.get('/drones/getallDrones', DroneController.getAllDrone);
app.delete('/drones/delete/:id', DroneController.deleteDrone);

describe('DroneController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('addNewDrone', () => {
    it('should add a new drone successfully', async () => {
      const newDrone = { name: 'Drone1', modelName: 'ModelX', serial: '12345' };
      const savedDrone = { _id: '1', ...newDrone };

      const MockDrone = Drone as jest.MockedClass<typeof Drone>;
      MockDrone.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedDrone)
      } as any));

      const response = await request(app)
        .post('/drones/add')
        .send(newDrone);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('Drone added successfully');
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.name).toBe(newDrone.name);
      expect(response.body.data.modelName).toBe(newDrone.modelName);
      expect(response.body.data.serial).toBe(newDrone.serial);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidDrone = { name: 'Drone1' }; // Missing modelName and serial

      const response = await request(app)
        .post('/drones/add')
        .send(invalidDrone);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('Name, model, and serial are required');
    });

    it('should handle errors', async () => {
      const newDrone = { name: 'Drone1', modelName: 'ModelX', serial: '12345' };

      const MockDrone = Drone as jest.MockedClass<typeof Drone>;
      MockDrone.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any));

      const response = await request(app)
        .post('/drones/add')
        .send(newDrone);

      expect(response.status).toBe(500);
      expect(response.body.status).toBe(false);
    });
  });

  describe('editDrone', () => {
    it('should update a drone successfully', async () => {
      const updateData = { name: 'UpdatedDrone' };
      const updatedDrone = { _id: '1', name: 'UpdatedDrone', modelName: 'ModelX', serial: '12345' };

      (Drone.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedDrone);

      const response = await request(app)
        .put('/drones/edit/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('Drone updated successfully');
      expect(response.body.data).toEqual(updatedDrone);
    });

    it('should return 404 if drone not found', async () => {
      (Drone.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/drones/edit/1')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('Drone not found');
    });
  });

  describe('getAllDrone', () => {
    it('should return all drones', async () => {
      const mockDrones = [
        { _id: '1', name: 'Drone1', modelName: 'ModelX', serial: '12345' },
        { _id: '2', name: 'Drone2', modelName: 'ModelY', serial: '67890' }
      ];

      (Drone.find as jest.Mock).mockResolvedValue(mockDrones);

      const response = await request(app).get('/drones/getallDrones');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('Drones retrieved successfully');
      expect(response.body.data).toEqual(mockDrones);
    });

    it('should handle errors', async () => {
      (Drone.find as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/drones/getallDrones');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('An error occurred while getting data from database');
    });
  });

  describe('deleteDrone', () => {
    it('should delete a drone and associated data successfully', async () => {
      const mockDrone = { _id: '1', name: 'Drone1' };

      (Drone.findByIdAndDelete as jest.Mock).mockResolvedValue(mockDrone);
      (Log.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });
      (Incident.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });
      (PrePostCheck.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const response = await request(app).delete('/drones/delete/1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('Drone and all associated data deleted successfully');
      expect(Drone.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(Log.deleteMany).toHaveBeenCalledWith({ drone: '1' });
      expect(Incident.deleteMany).toHaveBeenCalledWith({ drone: '1' });
      expect(PrePostCheck.deleteMany).toHaveBeenCalledWith({ drone: '1' });
    });

    it('should return 404 if drone not found', async () => {
      (Drone.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete('/drones/delete/1');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('Drone not found');
    });
  });
});
