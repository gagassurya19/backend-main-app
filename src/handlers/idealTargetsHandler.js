const createIdealTargets = async (request, h) => {
  try {
    const { prisma } = request;
    const { 
      bmiRecordId,
      weightRange, 
      targetWeight, 
      targetBMI, 
      targetCalories, 
      timeEstimate 
    } = request.payload;

    const idealTargets = await prisma.idealTargets.create({
      data: {
        bmiRecordId,
        weightRange,
        targetWeight,
        targetBMI,
        targetCalories,
        timeEstimate
      },
      include: {
        bmiRecord: {
          include: {
            userProfile: {
              select: {
                id: true,
                userAlias: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    return h.response({
      status: 'success',
      message: 'Ideal targets created successfully',
      data: { idealTargets }
    }).code(201);

  } catch (error) {
    console.error('Create ideal targets error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to create ideal targets'
    }).code(500);
  }
};

const getAllIdealTargets = async (request, h) => {
  try {
    const { prisma } = request;
    const { page = 1, limit = 10 } = request.query;
    
    const skip = (page - 1) * limit;
    
    const idealTargets = await prisma.idealTargets.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        bmiRecord: {
          include: {
            userProfile: {
              select: {
                id: true,
                userAlias: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        targetWeight: 'asc'
      }
    });

    const total = await prisma.idealTargets.count();

    return h.response({
      status: 'success',
      data: { 
        idealTargets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }).code(200);

  } catch (error) {
    console.error('Get ideal targets error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch ideal targets'
    }).code(500);
  }
};

const getIdealTargetsById = async (request, h) => {
  try {
    const { prisma } = request;
    const { id } = request.params;

    const idealTargets = await prisma.idealTargets.findUnique({
      where: { id },
      include: {
        bmiRecord: {
          include: {
            userProfile: {
              select: {
                id: true,
                userAlias: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!idealTargets) {
      return h.response({
        status: 'fail',
        message: 'Ideal targets not found'
      }).code(404);
    }

    return h.response({
      status: 'success',
      data: { idealTargets }
    }).code(200);

  } catch (error) {
    console.error('Get ideal targets error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch ideal targets'
    }).code(500);
  }
};

const getIdealTargetsByBMIRecord = async (request, h) => {
  try {
    const { prisma } = request;
    const { bmiRecordId } = request.params;

    const idealTargets = await prisma.idealTargets.findUnique({
      where: { bmiRecordId },
      include: {
        bmiRecord: {
          include: {
            userProfile: {
              select: {
                id: true,
                userAlias: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!idealTargets) {
      return h.response({
        status: 'fail',
        message: 'Ideal targets not found for this BMI record'
      }).code(404);
    }

    return h.response({
      status: 'success',
      data: { idealTargets }
    }).code(200);

  } catch (error) {
    console.error('Get ideal targets by BMI record error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch ideal targets'
    }).code(500);
  }
};

const updateIdealTargets = async (request, h) => {
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

    const idealTargets = await prisma.idealTargets.update({
      where: { id },
      data: updateData,
      include: {
        bmiRecord: {
          include: {
            userProfile: {
              select: {
                id: true,
                userAlias: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    return h.response({
      status: 'success',
      message: 'Ideal targets updated successfully',
      data: { idealTargets }
    }).code(200);

  } catch (error) {
    console.error('Update ideal targets error:', error);
    if (error.code === 'P2025') {
      return h.response({
        status: 'fail',
        message: 'Ideal targets not found'
      }).code(404);
    }
    return h.response({
      status: 'error',
      message: 'Failed to update ideal targets'
    }).code(500);
  }
};

const deleteIdealTargets = async (request, h) => {
  try {
    const { prisma } = request;
    const { id } = request.params;

    await prisma.idealTargets.delete({
      where: { id }
    });

    return h.response({
      status: 'success',
      message: 'Ideal targets deleted successfully'
    }).code(200);

  } catch (error) {
    console.error('Delete ideal targets error:', error);
    if (error.code === 'P2025') {
      return h.response({
        status: 'fail',
        message: 'Ideal targets not found'
      }).code(404);
    }
    return h.response({
      status: 'error',
      message: 'Failed to delete ideal targets'
    }).code(500);
  }
};

module.exports = {
  createIdealTargets,
  getAllIdealTargets,
  getIdealTargetsById,
  getIdealTargetsByBMIRecord,
  updateIdealTargets,
  deleteIdealTargets
}; 