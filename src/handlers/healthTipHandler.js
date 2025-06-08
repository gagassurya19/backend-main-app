const getAllHealthTips = async (request, h) => {
  try {
    const { prisma } = request;
    const { page = 1, limit = 10, category } = request.query;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(category && { category })
    };

    const [healthTips, total] = await Promise.all([
      prisma.healthTip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          imageUrl: true,
          createdAt: true
        }
      }),
      prisma.healthTip.count({ where })
    ]);

    return h.response({
      status: 'success',
      data: {
        healthTips,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }).code(200);

  } catch (error) {
    console.error('Get health tips error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch health tips'
    }).code(500);
  }
};

const getHealthTipById = async (request, h) => {
  try {
    const { prisma } = request;
    const { id } = request.params;

    const healthTip = await prisma.healthTip.findFirst({
      where: {
        id,
        isActive: true
      }
    });

    if (!healthTip) {
      return h.response({
        status: 'fail',
        message: 'Health tip not found'
      }).code(404);
    }

    return h.response({
      status: 'success',
      data: { healthTip }
    }).code(200);

  } catch (error) {
    console.error('Get health tip error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch health tip'
    }).code(500);
  }
};

const getCategories = async (request, h) => {
  try {
    const { prisma } = request;

    const categories = await prisma.healthTip.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category']
    });

    const categoryList = categories.map(item => item.category);

    return h.response({
      status: 'success',
      data: { categories: categoryList }
    }).code(200);

  } catch (error) {
    console.error('Get categories error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch categories'
    }).code(500);
  }
};

module.exports = {
  getAllHealthTips,
  getHealthTipById,
  getCategories
};

