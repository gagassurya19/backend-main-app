const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const predictionRoutes = require('./routes/prediction');
const healthTipRoutes = require('./routes/healthTip');

// Import database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type'],
        additionalHeaders: ['cache-control', 'x-requested-with'],
      },
      files: {
        relativeTo: require('path').join(__dirname, '../public')
      }
    },
  });

  // Register plugins
  await server.register([
    Inert,
    Vision
  ]);

  // Make Prisma available in request object
  server.ext('onRequest', (request, h) => {
    request.prisma = prisma;
    return h.continue;
  });

  // Register routes
  server.route(authRoutes);
  server.route(userRoutes);
  server.route(predictionRoutes);
  server.route(healthTipRoutes);

  // Health check endpoint
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return {
        message: 'KASEP Main Backend API',
        status: 'running',
        timestamp: new Date().toISOString()
      };
    }
  });

  // Handle file uploads endpoint
  server.route({
    method: 'GET',
    path: '/uploads/{file*}',
    handler: {
      directory: {
        path: '../uploads',
        redirectToSlash: true,
        index: false
      }
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
  console.log('Environment:', process.env.NODE_ENV);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

init();

