import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import connectDB from '../config/database';
import logsRouter from '../routes/logRouter';
import droneRouter from '../routes/droneRoute';
import incidentRouter from '../routes/incidentRoute';
import prePostCheckRouter from '../routes/prePostCheckRoute';

// Mock the database connection
jest.mock('../config/database');

const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use('/api/logs', logsRouter);
app.use('/api/drones', droneRouter);
app.use('/api/incidents', incidentRouter);
app.use('/api/prepostchecks', prePostCheckRouter);

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await connectDB();
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('Drone Management Flow', () => {
    let droneId: string;

    it('should create a new drone', async () => {
      const droneData = {
        name: 'Integration Test Drone',
        modelName: 'Test Model',
        serial: 'INT123456'
      };

      const response = await request(app)
        .post('/api/drones/add')
        .send(droneData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(droneData.name);
      expect(response.body.data.serial).toBe(droneData.serial);

      droneId = response.body.data._id;
    });

    it('should retrieve the created drone', async () => {
      const response = await request(app).get('/api/drones/getallDrones');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const drone = response.body.data.find((d: any) => d._id === droneId);
      expect(drone).toBeDefined();
      expect(drone.name).toBe('Integration Test Drone');
    });

    it('should update the drone', async () => {
      const updateData = {
        name: 'Updated Integration Test Drone',
        modelName: 'Updated Model'
      };

      const response = await request(app)
        .put(`/api/drones/edit/${droneId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.modelName).toBe(updateData.modelName);
    });
  });

  describe('Incident Management Flow', () => {
    let incidentId: string;
    let droneId: string;

    beforeAll(async () => {
      // Create a drone for incident testing
      const droneResponse = await request(app)
        .post('/api/drones/add')
        .send({
          name: 'Incident Test Drone',
          modelName: 'Test Model',
          serial: 'INC123456'
        });
      droneId = droneResponse.body.data._id;
    });

    it('should create a new incident', async () => {
      const incidentData = {
        drone: droneId,
        title: 'Integration Test Incident',
        description: 'Test incident for integration testing',
        severity: 'high',
        createdBy: 'test-user'
      };

      const response = await request(app)
        .post('/api/incidents')
        .send(incidentData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(incidentData.title);

      incidentId = response.body.data._id;
    });

    it('should retrieve all incidents', async () => {
      const response = await request(app).get('/api/incidents');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should retrieve incident by id', async () => {
      const response = await request(app).get(`/api/incidents/${incidentId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.data._id).toBe(incidentId);
      expect(response.body.data.title).toBe('Integration Test Incident');
    });

    it('should update the incident', async () => {
      const updateData = {
        title: 'Updated Integration Test Incident',
        severity: 'medium'
      };

      const response = await request(app)
        .put(`/api/incidents/${incidentId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.severity).toBe(updateData.severity);
    });

    it('should delete the incident', async () => {
      const response = await request(app).delete(`/api/incidents/${incidentId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('Incident deleted successfully');
    });
  });

  describe('PrePostCheck Management Flow', () => {
    let checkId: string;
    let droneId: string;
    let logId: string;

    beforeAll(async () => {
      // Create a drone and log for prepostcheck testing
      const droneResponse = await request(app)
        .post('/api/drones/add')
        .send({
          name: 'PrePostCheck Test Drone',
          modelName: 'Test Model',
          serial: 'PRE123456'
        });
      droneId = droneResponse.body.data._id;

      // Create a log (simplified, normally would upload)
      const Log = require('../models/Log').Log;
      const log = new Log({
        drone: droneId,
        filename: 'test.log',
        path: '/test/path',
        size: 100
      });
      await log.save();
      logId = log._id.toString();
    });

    it('should create a new pre/post check', async () => {
      const checkData = {
        drone: droneId,
        log: logId,
        type: 'pre',
        items: [
          { name: 'Battery Check', ok: true, notes: 'Battery at 100%' },
          { name: 'GPS Check', ok: true, notes: 'GPS locked' }
        ],
        performedBy: 'test-user'
      };

      const response = await request(app)
        .post('/api/prepostchecks')
        .send(checkData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.type).toBe(checkData.type);

      checkId = response.body.data._id;
    });

    it('should retrieve all pre/post checks', async () => {
      const response = await request(app).get('/api/prepostchecks');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should retrieve pre/post check by id', async () => {
      const response = await request(app).get(`/api/prepostchecks/${checkId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.data._id).toBe(checkId);
      expect(response.body.data.type).toBe('pre');
    });

    it('should update the pre/post check', async () => {
      const updateData = {
        performedBy: 'updated-user',
        items: [
          { name: 'Battery Check', ok: true, notes: 'Battery at 100%' },
          { name: 'GPS Check', ok: false, notes: 'GPS lost signal' }
        ]
      };

      const response = await request(app)
        .put(`/api/prepostchecks/${checkId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.data.performedBy).toBe(updateData.performedBy);
    });

    it('should delete the pre/post check', async () => {
      const response = await request(app).delete(`/api/prepostchecks/${checkId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('PrePostCheck deleted successfully');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent drone', async () => {
      const response = await request(app).get('/api/drones/getallDrones');

      // This should work, but let's test a specific non-existent ID
      const nonexistentResponse = await request(app).put('/api/drones/edit/507f1f77bcf86cd799439011').send({ name: 'Test' });

      expect(nonexistentResponse.status).toBe(404);
      expect(nonexistentResponse.body.status).toBe(false);
    });

    it('should return 404 for non-existent incident', async () => {
      const response = await request(app).get('/api/incidents/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(false);
    });

    it('should return 404 for non-existent pre/post check', async () => {
      const response = await request(app).get('/api/prepostchecks/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(false);
    });
  });
});
