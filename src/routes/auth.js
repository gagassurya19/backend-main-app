const authHandler = require('../handlers/authHandler');
const Joi = require('@hapi/joi');

module.exports = [
  {
    method: 'POST',
    path: '/auth/register',
    handler: authHandler.register,
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().min(6).required(),
          fullName: Joi.string().min(2).required()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/login',
    handler: authHandler.login,
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/refresh',
    handler: authHandler.refresh,
    options: {
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown()
      }
    }
  }
];

