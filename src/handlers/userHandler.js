const getProfile = async (request, h) => {
  try {
    const { prisma, auth } = request;

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        age: true,
        calories_now: true,
        calories_target: true,
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

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        age: true,
        calories_now: true,
        calories_target: true,
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

module.exports = {
  getProfile,
  updateProfile
};

