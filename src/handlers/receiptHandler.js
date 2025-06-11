const createReceipt = async (request, h) => {
  try {
    const { prisma } = request;
    const { 
      judul, 
      gambar, 
      deskripsi, 
      labelBahan, 
      metodeMemasak, 
      kalori, 
      protein, 
      lemak, 
      karbohidrat,
      ingredients = [],
      steps = []
    } = request.payload;

    const receipt = await prisma.receipt.create({
      data: {
        judul,
        gambar,
        deskripsi,
        labelBahan: JSON.stringify(labelBahan),
        metodeMemasak: JSON.stringify(metodeMemasak),
        kalori,
        protein,
        lemak,
        karbohidrat,
        ingredients: {
          create: ingredients.map(ingredient => ({
            bahan: ingredient.bahan
          }))
        },
        steps: {
          create: steps.map((step, index) => ({
            stepNumber: index + 1,
            description: step.description,
            images: {
              create: step.images ? step.images.map((image, imgIndex) => ({
                url: image.url,
                order: imgIndex + 1
              })) : []
            }
          }))
        }
      },
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
    });

    return h.response({
      status: 'success',
      message: 'Receipt created successfully',
      data: { receipt }
    }).code(201);

  } catch (error) {
    console.error('Create receipt error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to create receipt'
    }).code(500);
  }
};

const getAllReceipts = async (request, h) => {
  try {
    const { prisma } = request;
    const { page = 1, limit = 10, search } = request.query;
    
    const skip = (page - 1) * limit;
    const where = search ? {
      OR: [
        { judul: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } }
      ]
    } : {};
    
    const receipts = await prisma.receipt.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        ingredients: true,
        steps: {
          include: {
            images: true
          },
          orderBy: {
            stepNumber: 'asc'
          }
        },
        _count: {
          select: {
            History: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.receipt.count({ where });

    return h.response({
      status: 'success',
      data: { 
        receipts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }).code(200);

  } catch (error) {
    console.error('Get receipts error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch receipts'
    }).code(500);
  }
};

const getReceiptById = async (request, h) => {
  try {
    const { prisma } = request;
    const { id } = request.params;

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        ingredients: true,
        steps: {
          include: {
            images: {
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            stepNumber: 'asc'
          }
        },
        History: {
          include: {
            user: {
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

    if (!receipt) {
      return h.response({
        status: 'fail',
        message: 'Receipt not found'
      }).code(404);
    }

    // Parse JSON fields
    receipt.labelBahan = JSON.parse(receipt.labelBahan);
    receipt.metodeMemasak = JSON.parse(receipt.metodeMemasak);

    return h.response({
      status: 'success',
      data: { receipt }
    }).code(200);

  } catch (error) {
    console.error('Get receipt error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch receipt'
    }).code(500);
  }
};

const updateReceipt = async (request, h) => {
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
    if (updateData.labelBahan) {
      updateData.labelBahan = JSON.stringify(updateData.labelBahan);
    }
    if (updateData.metodeMemasak) {
      updateData.metodeMemasak = JSON.stringify(updateData.metodeMemasak);
    }

    const receipt = await prisma.receipt.update({
      where: { id },
      data: updateData,
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
    });

    return h.response({
      status: 'success',
      message: 'Receipt updated successfully',
      data: { receipt }
    }).code(200);

  } catch (error) {
    console.error('Update receipt error:', error);
    if (error.code === 'P2025') {
      return h.response({
        status: 'fail',
        message: 'Receipt not found'
      }).code(404);
    }
    return h.response({
      status: 'error',
      message: 'Failed to update receipt'
    }).code(500);
  }
};

const deleteReceipt = async (request, h) => {
  try {
    const { prisma } = request;
    const { id } = request.params;

    await prisma.receipt.delete({
      where: { id }
    });

    return h.response({
      status: 'success',
      message: 'Receipt deleted successfully'
    }).code(200);

  } catch (error) {
    console.error('Delete receipt error:', error);
    if (error.code === 'P2025') {
      return h.response({
        status: 'fail',
        message: 'Receipt not found'
      }).code(404);
    }
    return h.response({
      status: 'error',
      message: 'Failed to delete receipt'
    }).code(500);
  }
};

module.exports = {
  createReceipt,
  getAllReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt
}; 