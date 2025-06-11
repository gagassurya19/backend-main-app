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
          firstName: Joi.string().min(1),
          lastName: Joi.string().min(1),
          email: Joi.string().email(),
          birthDate: Joi.date(),
          gender: Joi.string().valid('male', 'female'),
          height: Joi.number().integer().min(50).max(300),
          weight: Joi.number().integer().min(20).max(500),
          targetCalories: Joi.number().integer().min(500).max(5000),
          activityLevel: Joi.string().valid('sedentary', 'light', 'moderate', 'active', 'very_active'),
          userAlias: Joi.string().min(1),
          username: Joi.string().min(1),
          password: Joi.string().min(8),
          confirmPassword: Joi.string().valid(Joi.ref('password')).when('password', {
            is: Joi.exist(),
            then: Joi.required(),
            otherwise: Joi.optional()
          })
        })
      }
    }
  },
];

