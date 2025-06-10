const createHistory = async (request, h) => {
  try {
    const { prisma, auth } = request;
    const { 
      receiptId, 
      detectedLabels, 
      photoUrl, 
      category, 
      notes, 
      bahanUtama, 
      bahanKurang 
    } = request.payload;

    const history = await prisma.history.create({
      data: {
        userId: auth.userId,
        receiptId,
        detectedLabels: JSON.stringify(detectedLabels),
        photoUrl,
        category,
        notes,
        bahanUtama: bahanUtama ? JSON.stringify(bahanUtama) : null,
        bahanKurang: bahanKurang ? JSON.stringify(bahanKurang) : null
      },
      include: {
        user: {
          select: {
            id: true,
            userAlias: true,
            firstName: true,
            lastName: true
          }
        },
        receipt: {
          select: {
            id: true,
            judul: true,
            gambar: true,
            kalori: true,
            protein: true,
            lemak: true,
            karbohidrat: true
          }
        }
      }
    });

    return h.response({
      status: 'success',
      message: 'History created successfully',
      data: { history }
    }).code(201);

  } catch (error) {
    console.error('Create history error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to create history'
    }).code(500);
  }
};

const getAllHistory = async (request, h) => {
  try {
    const { prisma } = request;
    const { page = 1, limit = 10, userId, receiptId, category } = request.query;
    
    const skip = (page - 1) * limit;
    let where = {};
    
    if (userId) where.userId = userId;
    if (receiptId) where.receiptId = receiptId;
    if (category) where.category = category;
    
    const histories = await prisma.history.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            userAlias: true,
            firstName: true,
            lastName: true
          }
        },
        receipt: {
          select: {
            id: true,
            judul: true,
            gambar: true,
            kalori: true,
            protein: true,
            lemak: true,
            karbohidrat: true
          }
        }
      },
      orderBy: {
        selectedAt: 'desc'
      }
    });

    const total = await prisma.history.count({ where });

    return h.response({
      status: 'success',
      data: { 
        histories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }).code(200);

  } catch (error) {
    console.error('Get histories error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch histories'
    }).code(500);
  }
};

const getHistoryById = async (request, h) => {
  try {
    const { prisma } = request;
    const { id } = request.params;

    const history = await prisma.history.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            userAlias: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        receipt: {
          include: {
            ingredients: true,
            steps: {
              include: {
                images: true
              },
              orderBy: {
                stepNumber: 'asc'
              }
            }
          }
        }
      }
    });

    if (!history) {
      return h.response({
        status: 'fail',
        message: 'History not found'
      }).code(404);
    }

    // Parse JSON fields
    history.detectedLabels = JSON.parse(history.detectedLabels);
    if (history.bahanUtama) {
      history.bahanUtama = JSON.parse(history.bahanUtama);
    }
    if (history.bahanKurang) {
      history.bahanKurang = JSON.parse(history.bahanKurang);
    }

    return h.response({
      status: 'success',
      data: { history }
    }).code(200);

  } catch (error) {
    console.error('Get history error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch history'
    }).code(500);
  }
};

const getUserHistory = async (request, h) => {
  try {
    const { prisma, auth } = request;
    const { page = 1, limit = 10, category } = request.query;
    
    const skip = (page - 1) * limit;
    let where = { userId: auth.userId };
    
    if (category) where.category = category;
    
    const histories = await prisma.history.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        receipt: {
          select: {
            id: true,
            judul: true,
            gambar: true,
            kalori: true,
            protein: true,
            lemak: true,
            karbohidrat: true
          }
        }
      },
      orderBy: {
        selectedAt: 'desc'
      }
    });

    const total = await prisma.history.count({ where });

    return h.response({
      status: 'success',
      data: { 
        histories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }).code(200);

  } catch (error) {
    console.error('Get user history error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch user history'
    }).code(500);
  }
};

const updateHistory = async (request, h) => {
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

    // Handle JSON fields
    if (updateData.detectedLabels) {
      updateData.detectedLabels = JSON.stringify(updateData.detectedLabels);
    }
    if (updateData.bahanUtama) {
      updateData.bahanUtama = JSON.stringify(updateData.bahanUtama);
    }
    if (updateData.bahanKurang) {
      updateData.bahanKurang = JSON.stringify(updateData.bahanKurang);
    }

    const history = await prisma.history.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            userAlias: true,
            firstName: true,
            lastName: true
          }
        },
        receipt: {
          select: {
            id: true,
            judul: true,
            gambar: true,
            kalori: true
          }
        }
      }
    });

    return h.response({
      status: 'success',
      message: 'History updated successfully',
      data: { history }
    }).code(200);

  } catch (error) {
    console.error('Update history error:', error);
    if (error.code === 'P2025') {
      return h.response({
        status: 'fail',
        message: 'History not found'
      }).code(404);
    }
    return h.response({
      status: 'error',
      message: 'Failed to update history'
    }).code(500);
  }
};

const deleteHistory = async (request, h) => {
  try {
    const { prisma } = request;
    const { id } = request.params;

    await prisma.history.delete({
      where: { id }
    });

    return h.response({
      status: 'success',
      message: 'History deleted successfully'
    }).code(200);

  } catch (error) {
    console.error('Delete history error:', error);
    if (error.code === 'P2025') {
      return h.response({
        status: 'fail',
        message: 'History not found'
      }).code(404);
    }
    return h.response({
      status: 'error',
      message: 'Failed to delete history'
    }).code(500);
  }
};

module.exports = {
  createHistory,
  getAllHistory,
  getHistoryById,
  getUserHistory,
  updateHistory,
  deleteHistory
}; 