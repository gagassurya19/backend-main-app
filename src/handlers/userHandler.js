const getProfile = async (request, h) => {
  try {
    const { prisma, auth } = request;

    const user = await prisma.userProfile.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        userAlias: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        gender: true,
        height: true,
        weight: true,
        activityLevel: true,
        authProvider: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return h.response({
        status: 'fail',
        message: 'User not found'
      }).code(404);
    }

    return h.response({
      status: 'success',
      data: { user }
    }).code(200);

  } catch (error) {
    console.error('Get profile error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch user profile'
    }).code(500);
  }
};

const updateProfile = async (request, h) => {
  try {
    const { prisma, auth } = request;
    const updateData = request.payload;

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const user = await prisma.userProfile.update({
      where: { id: auth.userId },
      data: updateData,
      select: {
        id: true,
        userAlias: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        gender: true,
        height: true,
        weight: true,
        activityLevel: true,
        updatedAt: true
      }
    });

    return h.response({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user }
    }).code(200);

  } catch (error) {
    console.error('Update profile error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to update profile'
    }).code(500);
  }
};

const getAllUsers = async (request, h) => {
  try {
    const { prisma } = request;
    const { page = 1, limit = 10 } = request.query;
    
    const skip = (page - 1) * limit;
    
    const users = await prisma.userProfile.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      select: {
        id: true,
        userAlias: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        gender: true,
        activityLevel: true,
        createdAt: true
      }
    });

    const total = await prisma.userProfile.count();

    return h.response({
      status: 'success',
      data: { 
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }).code(200);

  } catch (error) {
    console.error('Get all users error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch users'
    }).code(500);
  }
};

const getUserById = async (request, h) => {
  try {
    const { prisma } = request;
    const { id } = request.params;

    const user = await prisma.userProfile.findUnique({
      where: { id },
      include: {
        bmiRecords: true,
        History: true
      }
    });

    if (!user) {
      return h.response({
        status: 'fail',
        message: 'User not found'
      }).code(404);
    }

    return h.response({
      status: 'success',
      data: { user }
    }).code(200);

  } catch (error) {
    console.error('Get user by ID error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch user'
    }).code(500);
  }
};

const deleteUser = async (request, h) => {
  try {
    const { prisma } = request;
    const { id } = request.params;

    // Check if user exists
    const existingUser = await prisma.userProfile.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return h.response({
        status: 'fail',
        message: 'User not found'
      }).code(404);
    }

    // Delete user (cascade will handle related records)
    await prisma.userProfile.delete({
      where: { id }
    });

    return h.response({
      status: 'success',
      message: 'User deleted successfully'
    }).code(200);

  } catch (error) {
    console.error('Delete user error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to delete user'
    }).code(500);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  deleteUser
};

