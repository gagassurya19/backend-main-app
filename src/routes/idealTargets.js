const idealTargetsHandler = require('../handlers/idealTargetsHandler');
const Joi = require('@hapi/joi');

module.exports = [
  // Create ideal targets
  {
    method: 'POST',
    path: '/ideal-targets',
    handler: idealTargetsHandler.createIdealTargets,
    options: {
      validate: {
        payload: Joi.object({
          bmiRecordId: Joi.string().uuid().required(),
          weightRange: Joi.string().required(),
          targetWeight: Joi.number().integer().min(20).max(500).required(),
          targetBMI: Joi.string().required(),
          targetCalories: Joi.number().integer().min(500).max(5000).required(),
          timeEstimate: Joi.string().required()
        })
      }
    }
  },
  
  // Get all ideal targets
  {
    method: 'GET',
    path: '/ideal-targets',
    handler: idealTargetsHandler.getAllIdealTargets,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10)
        })
      }
    }
  },
  
  // Get ideal targets by ID
  {
    method: 'GET',
    path: '/ideal-targets/{id}',
    handler: idealTargetsHandler.getIdealTargetsById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required()
        })
      }
    }
  },
  
  // Get ideal targets by BMI record ID
  {
    method: 'GET',
    path: '/ideal-targets/bmi/{bmiRecordId}',
    handler: idealTargetsHandler.getIdealTargetsByBMIRecord,
    options: {
      validate: {
        params: Joi.object({
          bmiRecordId: Joi.string().uuid().required()
        })
      }
    }
  },
  
  // Update ideal targets
  {
    method: 'PUT',
    path: '/ideal-targets/{id}',
    handler: idealTargetsHandler.updateIdealTargets,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required()
        }),
        payload: Joi.object({
          weightRange: Joi.string(),
          targetWeight: Joi.number().integer().min(20).max(500),
          targetBMI: Joi.string(),
          targetCalories: Joi.number().integer().min(500).max(5000),
          timeEstimate: Joi.string()
        })
      }
    }
  },
  
  // Delete ideal targets
  {
    method: 'DELETE',
    path: '/ideal-targets/{id}',
    handler: idealTargetsHandler.deleteIdealTargets,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required()
        })
      }
    }
  }
]; 