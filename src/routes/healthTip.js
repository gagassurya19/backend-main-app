const healthTipHandler = require('../handlers/healthTipHandler');
const Joi = require('@hapi/joi');

module.exports = [
  {
    method: 'GET',
    path: '/health-tips',
    handler: healthTipHandler.getAllHealthTips,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          category: Joi.string()
        })
      }
    }
  },
  {
    method: 'GET',
    path: '/health-tips/{id}',
    handler: healthTipHandler.getHealthTipById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required()
        })
      }
    }
  },
  {
    method: 'GET',
    path: '/health-tips/categories',
    handler: healthTipHandler.getCategories
  }
];

