const bcrypt = require('bcrypt');

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
        targetCalories: true,
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

    // Validate required fields if provided
    const allowedFields = ['firstName', 'lastName', 'email', 'gender', 'birthDate', 'height', 'weight', 'targetCalories', 'activityLevel', 'userAlias', 'username', 'password'];
    const filteredData = {};

    // Filter and validate input data (exclude confirmPassword as it's only for validation)
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined && updateData[key] !== null && updateData[key] !== '') {
        filteredData[key] = updateData[key];
      }
    });

    // Validate firstName and lastName minimum length
    if (filteredData.firstName && filteredData.firstName.trim().length < 1) {
      return h.response({
        status: 'fail',
        message: 'First name must be at least 1 character long'
      }).code(400);
    }

    if (filteredData.lastName && filteredData.lastName.trim().length < 1) {
      return h.response({
        status: 'fail',
        message: 'Last name must be at least 1 character long'
      }).code(400);
    }

    // Validate email format if email is being updated
    if (filteredData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(filteredData.email)) {
        return h.response({
          status: 'fail',
          message: 'Invalid email format'
        }).code(400);
      }

      // Check if email already exists (for other users)
      const existingUser = await prisma.userProfile.findFirst({
        where: {
          email: filteredData.email,
          NOT: { id: auth.userId }
        }
      });

      if (existingUser) {
        return h.response({
          status: 'fail',
          message: 'Email already exists'
        }).code(409);
      }
    }

    // Validate userAlias uniqueness if provided
    if (filteredData.userAlias) {
      const existingUserAlias = await prisma.userProfile.findFirst({
        where: {
          userAlias: filteredData.userAlias,
          NOT: { id: auth.userId }
        }
      });

      if (existingUserAlias) {
        return h.response({
          status: 'fail',
          message: 'User alias already exists'
        }).code(409);
      }
    }

    // Validate username uniqueness if provided
    if (filteredData.username) {
      const existingUsername = await prisma.userProfile.findFirst({
        where: {
          username: filteredData.username,
          NOT: { id: auth.userId }
        }
      });

      if (existingUsername) {
        return h.response({
          status: 'fail',
          message: 'Username already exists'
        }).code(409);
      }
    }

    // Validate gender if provided
    if (filteredData.gender && !['male', 'female', 'other'].includes(filteredData.gender.toLowerCase())) {
      return h.response({
        status: 'fail',
        message: 'Invalid gender value. Must be male, female, or other'
      }).code(400);
    }

    // Validate birthDate if provided
    if (filteredData.birthDate) {
      const birthDate = new Date(filteredData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        return h.response({
          status: 'fail',
          message: 'Birth date cannot be in the future'
        }).code(400);
      }
    }

    // Validate numeric fields
    if (filteredData.height && (isNaN(filteredData.height) || filteredData.height <= 0)) {
      return h.response({
        status: 'fail',
        message: 'Height must be a positive number'
      }).code(400);
    }

    if (filteredData.weight && (isNaN(filteredData.weight) || filteredData.weight <= 0)) {
      return h.response({
        status: 'fail',
        message: 'Weight must be a positive number'
      }).code(400);
    }

    if (filteredData.targetCalories && (isNaN(filteredData.targetCalories) || filteredData.targetCalories <= 0)) {
      return h.response({
        status: 'fail',
        message: 'Target calories must be a positive number'
      }).code(400);
    }

    // Validate password if provided
    if (filteredData.password) {
      if (filteredData.password.length < 8) {
        return h.response({
          status: 'fail',
          message: 'Password must be at least 8 characters long'
        }).code(400);
      }

      // Hash the password before storing
      filteredData.password = await bcrypt.hash(filteredData.password, 12);
    }

    // Check if user exists before updating
    const existingUserProfile = await prisma.userProfile.findUnique({
      where: { id: auth.userId }
    });

    if (!existingUserProfile) {
      return h.response({
        status: 'fail',
        message: 'User profile not found'
      }).code(404);
    }

    // Update user profile
    const user = await prisma.userProfile.update({
      where: { id: auth.userId },
      data: {
        ...filteredData,
        updatedAt: new Date()
      },
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
        targetCalories: true,
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
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return h.response({
        status: 'fail',
        message: 'Email or username already exists'
      }).code(409);
    }

    if (error.code === 'P2025') {
      return h.response({
        status: 'fail',
        message: 'User not found'
      }).code(404);
    }

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


