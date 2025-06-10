const historyHandler = require('../handlers/historyHandler');
const { verifyToken, extractToken } = require('../utils/jwt');
const Joi = require('@hapi/joi');

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
  // Create history (authenticated)
  {
    method: 'POST',
    path: '/history',
    handler: historyHandler.createHistory,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown(),
        payload: Joi.object({
          receiptId: Joi.string().uuid().required(),
          detectedLabels: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
          photoUrl: Joi.string(),
          category: Joi.string(),
          notes: Joi.string(),
          bahanUtama: Joi.alternatives().try(Joi.string(), Joi.array()),
          bahanKurang: Joi.alternatives().try(Joi.string(), Joi.array())
        })
      }
    }
  },
  
  // Get current user's history
  {
    method: 'GET',
    path: '/history/my-history',
    handler: historyHandler.getUserHistory,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown(),
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          category: Joi.string()
        })
      }
    }
  },
  
  // Get all history (admin)
  {
    method: 'GET',
    path: '/history',
    handler: historyHandler.getAllHistory,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          userId: Joi.string().uuid(),
          receiptId: Joi.string().uuid(),
          category: Joi.string()
        })
      }
    }
  },
  
  // Get history by ID
  {
    method: 'GET',
    path: '/history/{id}',
    handler: historyHandler.getHistoryById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required()
        })
      }
    }
  },
  
  // Update history
  {
    method: 'PUT',
    path: '/history/{id}',
    handler: historyHandler.updateHistory,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required()
        }),
        payload: Joi.object({
          detectedLabels: Joi.alternatives().try(Joi.string(), Joi.array()),
          photoUrl: Joi.string(),
          category: Joi.string(),
          notes: Joi.string(),
          bahanUtama: Joi.alternatives().try(Joi.string(), Joi.array()),
          bahanKurang: Joi.alternatives().try(Joi.string(), Joi.array())
        })
      }
    }
  },
  
  // Delete history
  {
    method: 'DELETE',
    path: '/history/{id}',
    handler: historyHandler.deleteHistory,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required()
        })
      }
    }
  }
]; 