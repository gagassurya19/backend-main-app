const predictionHandler = require('../handlers/predictionHandler');
const { verifyToken, extractToken } = require('../utils/jwt');
const Joi = require('@hapi/joi');

// Middleware for authentication
const authenticate = async (request, h) => {
  try {
    const authHeader = request.headers.authorization;
    const token = extractToken(authHeader);
    const decoded = verifyToken(token);
    
    request.auth = { userId: decoded.userId, email: decoded.email };
    return h.continue;
  } catch (error) {
    return h.response({
      status: 'fail',
      message: 'Authentication required'
    }).code(401).takeover();
  }
};

module.exports = [
  {
    method: 'POST',
    path: '/predict',
    handler: predictionHandler.predict,
    options: {
      pre: [{ method: authenticate }],
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
      },
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown()
      }
    }
  },
  {
    method: 'GET',
    path: '/predictions',
    handler: predictionHandler.getUserPredictions,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown(),
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10)
        })
      }
    }
  },
  {
    method: 'GET',
    path: '/predictions/{id}',
    handler: predictionHandler.getPredictionById,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown(),
        params: Joi.object({
          id: Joi.string().required()
        })
      }
    }
  },
  {
    method: 'DELETE',
    path: '/predictions/{id}',
    handler: predictionHandler.deletePrediction,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown(),
        params: Joi.object({
          id: Joi.string().required()
        })
      }
    }
  }
];

