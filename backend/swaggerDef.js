const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Drone Log Management API',
    version: '1.0.0',
    description: 'API for managing drone logs, incidents, and pre/post checks',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
};

module.exports = swaggerDefinition;
