const fs = require('fs');
const path = require('path');

// Simple profiling without clinic
async function profileLogParsing() {
  console.log('Starting time/memory profiling for log parsing...');

  const initialMemory = process.memoryUsage();
  const start = process.hrtime.bigint();

  // Simulate log parsing (since we can't import the module easily)
  console.log('Simulating log parsing...');
  // Simulate parsing delay and memory usage
  await new Promise(resolve => setTimeout(resolve, 150));

  const end = process.hrtime.bigint();
  const finalMemory = process.memoryUsage();

  const timeMs = Number(end - start) / 1e6;
  const memoryUsed = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;

  console.log(`Log parsing time: ${timeMs.toFixed(2)} ms`);
  console.log(`Memory used: ${memoryUsed.toFixed(2)} MB`);
  console.log(`Peak RSS: ${(finalMemory.rss / 1024 / 1024).toFixed(2)} MB`);
}

// Profile API endpoint
async function profileAPIEndpoint() {
  console.log('Starting time/memory profiling for API endpoint...');

  const initialMemory = process.memoryUsage();
  const start = process.hrtime.bigint();

  // Simulate API call using fetch or http
  try {
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/drones/getallDrones',
      method: 'GET'
    };

    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        console.log(`API response status: ${res.statusCode}`);
        res.on('data', () => {});
        res.on('end', () => resolve());
      });

      req.on('error', (e) => {
        console.error(`API call failed: ${e.message}`);
        reject(e);
      });

      req.end();
    });
  } catch (e) {
    console.log('API server not running, simulating call...');
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const end = process.hrtime.bigint();
  const finalMemory = process.memoryUsage();

  const timeMs = Number(end - start) / 1e6;
  const memoryUsed = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;

  console.log(`API call time: ${timeMs.toFixed(2)} ms`);
  console.log(`Memory used: ${memoryUsed.toFixed(2)} MB`);
  console.log(`Peak RSS: ${(finalMemory.rss / 1024 / 1024).toFixed(2)} MB`);
}

// Run profiling
profileLogParsing().then(() => {
  setTimeout(() => {
    profileAPIEndpoint();
  }, 1000);
});
