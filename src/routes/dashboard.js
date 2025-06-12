const dashboardHandler = require('../handlers/dashboardHandler');
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
  // Get weekly calorie data for current user
  {
    method: 'GET',
    path: '/dashboard/weekly-calories',
    handler: dashboardHandler.getWeeklyCalories,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown()
      }
    }
  },

  // Get today's food history for current user
  {
    method: 'GET',
    path: '/dashboard/history-today',
    handler: dashboardHandler.getHistoryToday,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown()
      }
    }
  },

  // Get weekly benchmark data for current user
  {
    method: 'GET',
    path: '/dashboard/weekly-benchmark',
    handler: dashboardHandler.getWeeklyBenchmark,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown()
      }
    }
  },

  // Get most consumed ingredients for current user
  {
    method: 'GET',
    path: '/dashboard/most-consumed-ingredients',
    handler: dashboardHandler.getMostConsumedIngredients,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown()
      }
    }
  },

  // Get history calories for different periods (line chart)
  {
    method: 'GET',
    path: '/dashboard/history-calories',
    handler: dashboardHandler.getHistoryCalories,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown()
      }
    }
  }
];