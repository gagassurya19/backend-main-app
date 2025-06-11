const bmiHandler = require('../handlers/bmiHandler');
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
  // Create BMI record (authenticated)
  {
    method: 'POST',
    path: '/bmi',
    handler: bmiHandler.createBMIRecord,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown(),
        payload: Joi.object({
          date: Joi.date().required(),
          height: Joi.number().integer().min(50).max(300).required(),
          weight: Joi.number().integer().min(20).max(500).required(),
          activityLevel: Joi.string().valid('sedentary', 'light', 'moderate', 'active', 'very_active').required(),
          bmi: Joi.number().min(10).max(50).required(),
          category: Joi.string().required(),
          healthStatus: Joi.string().required(),
          targetCalories: Joi.number().integer().min(500).max(5000).required(),
          hasGoals: Joi.boolean().required(),
          idealTargets: Joi.when('hasGoals', {
            is: true,
            then: Joi.object({
              weightRange: Joi.string().required(),
              targetWeight: Joi.number().integer().min(20).max(500).required(),
              targetBMI: Joi.string().required(),
              targetCalories: Joi.number().integer().min(500).max(5000).required(),
              timeEstimate: Joi.string().required()
            }).required(),
            otherwise: Joi.forbidden()
          })
        })
      }
    }
  },
  
  // Get current user's BMI records
  {
    method: 'GET',
    path: '/bmi/my-records',
    handler: bmiHandler.getUserBMIRecords,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown(),
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          category: Joi.string().valid('all', 'underweight', 'normal', 'overweight', 'obese', 'with-goals', 'without-goals').default('all')
        })
      }
    }
  },

  // Get BMI statistics for current user
  {
    method: 'GET',
    path: '/bmi/statistics',
    handler: bmiHandler.getBMIStatistics,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown()
      }
    }
  },

  // Get BMI trends for current user
  {
    method: 'GET',
    path: '/bmi/trends',
    handler: bmiHandler.getBMITrends,
    options: {
      pre: [{ method: authenticate }],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).unknown()
      }
    }
  },
  
  // Get all BMI records (admin)
  {
    method: 'GET',
    path: '/bmi',
    handler: bmiHandler.getAllBMIRecords,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          userId: Joi.string().uuid()
        })
      }
    }
  },
  
  // Get BMI record by ID
  {
    method: 'GET',
    path: '/bmi/{id}',
    handler: bmiHandler.getBMIRecordById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required()
        })
      }
    }
  },
  
  // Update BMI record
  {
    method: 'PUT',
    path: '/bmi/{id}',
    handler: bmiHandler.updateBMIRecord,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required()
        }),
        payload: Joi.object({
          date: Joi.date(),
          height: Joi.number().integer().min(50).max(300),
          weight: Joi.number().integer().min(20).max(500),
          age: Joi.number().integer().min(1).max(150),
          gender: Joi.string().valid('male', 'female'),
          activityLevel: Joi.string().valid('sedentary', 'light', 'moderate', 'active', 'very_active'),
          bmi: Joi.number().min(10).max(50),
          category: Joi.string(),
          healthStatus: Joi.string(),
          targetCalories: Joi.number().integer().min(500).max(5000),
          hasGoals: Joi.boolean()
        })
      }
    }
  },
  
  // Delete BMI record
  {
    method: 'DELETE',
    path: '/bmi/{id}',
    handler: bmiHandler.deleteBMIRecord,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required()
        })
      }
    }
  }
]; 