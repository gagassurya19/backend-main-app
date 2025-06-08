const userHandler = require('../handlers/userHandler');
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
  {
    method: 'GET',
    path: '/user/profile',
    handler: userHandler.getProfile,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown()
      }
    }
  },
  {
    method: 'PUT',
    path: '/user/profile',
    handler: userHandler.updateProfile,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown(),
        payload: Joi.object({
          fullName: Joi.string().min(2),
          age: Joi.number().integer().min(1).max(150),
          calories_now: Joi.number().min(0),
          calories_target: Joi.number().min(0)
        })
      }
    }
  }
];

