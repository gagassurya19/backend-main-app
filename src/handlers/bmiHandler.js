// Import BMI utility functions
const {
  calculateBMI,
  calculateBMR,
  getBMICategory,
  getHealthStatus,
  getActivityMultiplier,
  getTargetCalories
} = require('../utils/bmiCalculations');

const createBMIRecord = async (request, h) => {
  try {
    const { prisma, auth } = request;
    const { 
      date, 
      height, 
      weight, 
      activityLevel, 
      bmi, 
      category, 
      healthStatus, 
      targetCalories, 
      hasGoals, 
      idealTargets 
    } = request.payload;

    // Fetch user profile to get gender and birthDate
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: auth.userId },
      select: { gender: true, birthDate: true }
    });

    if (!userProfile) {
      return h.response({
        status: 'error',
        message: 'User profile not found'
      }).code(404);
    }

    if (!userProfile.gender || !userProfile.birthDate) {
      return h.response({
        status: 'error',
        message: 'User profile must have gender and birth date set'
      }).code(400);
    }

    // Calculate age from birth date
    const today = new Date();
    const birthDate = new Date(userProfile.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Use transaction to ensure BMI record, ideal targets, and user profile update are created together
    const result = await prisma.$transaction(async (tx) => {
      // Create BMI record first
      const bmiRecord = await tx.bMIRecord.create({
        data: {
          date: new Date(date),
          height,
          weight,
          age,
          gender: userProfile.gender,
          activityLevel,
          bmi,
          category,
          healthStatus,
          targetCalories,
          hasGoals,
          userId: auth.userId
        }
      });

      // Update UserProfile with latest height, weight, and activityLevel
      await tx.userProfile.update({
        where: { id: auth.userId },
        data: {
          height,
          weight,
          activityLevel,
          targetCalories
        }
      });

      // If hasGoals is true, create ideal targets
      if (hasGoals && idealTargets) {
        await tx.idealTargets.create({
          data: {
            weightRange: idealTargets.weightRange,
            targetWeight: idealTargets.targetWeight,
            targetBMI: idealTargets.targetBMI,
            targetCalories: idealTargets.targetCalories,
            timeEstimate: idealTargets.timeEstimate,
            bmiRecordId: bmiRecord.id
          }
        });
      }

      // Return BMI record with ideal targets included
      return await tx.bMIRecord.findUnique({
        where: { id: bmiRecord.id },
        include: { idealTargets: true }
      });
    });

    return h.response({
      status: 'success',
      message: 'BMI record created successfully',
      data: { bmiRecord: result }
    }).code(201);

  } catch (error) {
    console.error('Create BMI record error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to create BMI record'
    }).code(500);
  }
};

const getAllBMIRecords = async (request, h) => {
  try {
    const { prisma } = request;
    const { page = 1, limit = 10, userId } = request.query;
    
    const skip = (page - 1) * limit;
    const where = userId ? { userId } : {};
    
    const bmiRecords = await prisma.bMIRecord.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        userProfile: {
          select: {
            id: true,
            userAlias: true,
            firstName: true,
            lastName: true
          }
        },
        idealTargets: true
      },
      orderBy: { date: 'desc' }
    });

    const total = await prisma.bMIRecord.count({ where });

    return h.response({
      status: 'success',
      data: { 
        bmiRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }).code(200);

  } catch (error) {
    console.error('Get BMI records error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch BMI records'
    }).code(500);
  }
};

const getBMIRecordById = async (request, h) => {
  try {
    const { prisma } = request;
    const { id } = request.params;

    const bmiRecord = await prisma.bMIRecord.findUnique({
      where: { id },
      include: {
        userProfile: {
          select: {
            id: true,
            userAlias: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        idealTargets: true
      }
    });

    if (!bmiRecord) {
      return h.response({
        status: 'fail',
        message: 'BMI record not found'
      }).code(404);
    }

    return h.response({
      status: 'success',
      data: { bmiRecord }
    }).code(200);

  } catch (error) {
    console.error('Get BMI record error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch BMI record'
    }).code(500);
  }
};

const getUserBMIRecords = async (request, h) => {
  try {
    const { prisma, auth } = request;
    const { page = 1, limit = 10, category = 'all' } = request.query;
    
    const skip = (page - 1) * limit;
    let where = { userId: auth.userId };
    
    // Apply category filter
    if (category !== 'all') {
      if (category === 'with-goals') {
        where.hasGoals = true;
      } else if (category === 'without-goals') {
        where.hasGoals = false;
      } else {
        where.category = category.charAt(0).toUpperCase() + category.slice(1);
      }
    }
    
    const bmiRecords = await prisma.bMIRecord.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: { idealTargets: true },
      orderBy: { date: 'desc' }
    });

    const total = await prisma.bMIRecord.count({ where });

    return h.response({
      status: 'success',
      data: { 
        bmiRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }).code(200);

  } catch (error) {
    console.error('Get user BMI records error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch BMI records'
    }).code(500);
  }
};

const updateBMIRecord = async (request, h) => {
  try {
    const { prisma } = request;
    const { id } = request.params;
    const updateData = request.payload;

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Convert date if provided
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const bmiRecord = await prisma.bMIRecord.update({
      where: { id },
      data: updateData,
      include: { idealTargets: true }
    });

    return h.response({
      status: 'success',
      message: 'BMI record updated successfully',
      data: { bmiRecord }
    }).code(200);

  } catch (error) {
    console.error('Update BMI record error:', error);
    if (error.code === 'P2025') {
      return h.response({
        status: 'fail',
        message: 'BMI record not found'
      }).code(404);
    }
    return h.response({
      status: 'error',
      message: 'Failed to update BMI record'
    }).code(500);
  }
};

const deleteBMIRecord = async (request, h) => {
  try {
    const { prisma } = request;
    const { id } = request.params;

    // Delete in a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // First, delete any related IdealTargets
      await tx.idealTargets.deleteMany({
        where: { bmiRecordId: id }
      });

      // Then delete the BMI record
      await tx.bMIRecord.delete({
        where: { id }
      });
    });

    return h.response({
      status: 'success',
      message: 'BMI record deleted successfully'
    }).code(200);

  } catch (error) {
    console.error('Delete BMI record error:', error);
    if (error.code === 'P2025') {
      return h.response({
        status: 'fail',
        message: 'BMI record not found'
      }).code(404);
    }
    return h.response({
      status: 'error',
      message: 'Failed to delete BMI record'
    }).code(500);
  }
};

const getBMIStatistics = async (request, h) => {
  try {
    const { prisma, auth } = request;
    
    const bmiRecords = await prisma.bMIRecord.findMany({
      where: { userId: auth.userId },
      orderBy: { date: 'desc' }
    });

    if (bmiRecords.length === 0) {
      return h.response({
        status: 'success',
        data: { statistics: null }
      }).code(200);
    }

    const bmis = bmiRecords.map(record => record.bmi);
    const weights = bmiRecords.map(record => record.weight);

    const statistics = {
      averageBMI: (bmis.reduce((a, b) => a + b, 0) / bmis.length).toFixed(1),
      minBMI: Math.min(...bmis).toFixed(1),
      maxBMI: Math.max(...bmis).toFixed(1),
      currentWeight: weights[0],
      weightChange: weights.length > 1 ? (weights[0] - weights[weights.length - 1]).toFixed(1) : '0',
      totalRecords: bmiRecords.length,
      recordsWithGoals: bmiRecords.filter(r => r.hasGoals).length
    };

    return h.response({
      status: 'success',
      data: { statistics }
    }).code(200);

  } catch (error) {
    console.error('Get BMI statistics error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch BMI statistics'
    }).code(500);
  }
};

const getBMITrends = async (request, h) => {
  try {
    const { prisma, auth } = request;
    
    const bmiRecords = await prisma.bMIRecord.findMany({
      where: { userId: auth.userId },
      orderBy: { date: 'desc' },
      take: 2
    });

    if (bmiRecords.length < 2) {
      return h.response({
        status: 'success',
        data: { trend: null }
      }).code(200);
    }

    const latest = bmiRecords[0];
    const previous = bmiRecords[1];
    const difference = latest.bmi - previous.bmi;

    const trend = {
      direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable',
      value: Math.abs(difference),
      percentage: Math.abs((difference / previous.bmi) * 100)
    };

    return h.response({
      status: 'success',
      data: { trend }
    }).code(200);

  } catch (error) {
    console.error('Get BMI trends error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch BMI trends'
    }).code(500);
  }
};

module.exports = {
  createBMIRecord,
  getAllBMIRecords,
  getBMIRecordById,
  getUserBMIRecords,
  updateBMIRecord,
  deleteBMIRecord,
  getBMIStatistics,
  getBMITrends
}; 