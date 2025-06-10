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
  // Get current user profile
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
  
  // Update current user profile
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
          userAlias: Joi.string().min(2),
          username: Joi.string().min(2),
          firstName: Joi.string().min(1),
          lastName: Joi.string().min(1),
          birthDate: Joi.date(),
          gender: Joi.string().valid('male', 'female'),
          height: Joi.number().integer().min(50).max(300),
          weight: Joi.number().integer().min(20).max(500),
          activityLevel: Joi.string().valid('sedentary', 'light', 'moderate', 'active', 'very_active')
        })
      }
    }
  },
  
  // Get all users (admin)
  {
    method: 'GET',
    path: '/users',
    handler: userHandler.getAllUsers,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10)
        })
      }
    }
  },
  
  // Get user by ID
  {
    method: 'GET',
    path: '/users/{id}',
    handler: userHandler.getUserById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required()
        })
      }
    }
  },
  
  // Delete user by ID
  {
    method: 'DELETE',
    path: '/users/{id}',
    handler: userHandler.deleteUser,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required()
        })
      }
    }
  }
];

