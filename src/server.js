const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const bmiRoutes = require('./routes/bmi');
const receiptRoutes = require('./routes/receipt');
const historyRoutes = require('./routes/history');

// Import database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
    routes: {
      cors: {
        origin: ['*'],
        credentials: true,
        headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-language'],
        additionalHeaders: ['cache-control', 'x-requested-with', 'x-forwarded-for', 'x-real-ip'],
        additionalExposedHeaders: ['cache-control', 'content-language', 'content-type', 'expires', 'last-modified', 'pragma']
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

  // Register CRUD routes
  server.route(authRoutes);
  server.route(userRoutes);
  server.route(bmiRoutes);
  server.route(receiptRoutes);
  server.route(historyRoutes);

  // CORS preflight handler for all routes
  server.route({
    method: 'OPTIONS',
    path: '/{any*}',
    handler: (request, h) => {
      return h.response()
        .code(200)
        .header('Access-Control-Allow-Origin', '*')
        .header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        .header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, If-None-Match, Accept-language, cache-control, x-requested-with');
    }
  });

  // Health check endpoint
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return {
        message: 'KASEP Main Backend API',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
          auth: '/auth/*',
          users: '/users, /user/*',
          bmi: '/bmi/*',
          receipts: '/receipts/*',
          history: '/history/*',
        }
      };
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Available endpoints:');
  console.log('- Auth: /auth/*');
  console.log('- Users: /users, /user/*');
  console.log('- BMI Records: /bmi/*');
  console.log('- Receipts: /receipts/*');
  console.log('- History: /history/*');
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

