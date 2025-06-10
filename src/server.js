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
const idealTargetsRoutes = require('./routes/idealTargets');
// const predictionRoutes = require('./routes/prediction'); // Keep if still needed
// const healthTipRoutes = require('./routes/healthTip'); // Keep if still needed

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

  // Register CRUD routes
  server.route(authRoutes);
  server.route(userRoutes);
  server.route(bmiRoutes);
  server.route(receiptRoutes);
  server.route(historyRoutes);
  server.route(idealTargetsRoutes);
  
  // Keep existing routes if they're still needed
  // server.route(predictionRoutes);
  // server.route(healthTipRoutes);

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
          idealTargets: '/ideal-targets/*'
        }
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
  console.log('Available endpoints:');
  console.log('- Auth: /auth/*');
  console.log('- Users: /users, /user/*');
  console.log('- BMI Records: /bmi/*');
  console.log('- Receipts: /receipts/*');
  console.log('- History: /history/*');
  console.log('- Ideal Targets: /ideal-targets/*');
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

