const mlService = require('../services/mlService');
const { saveUploadedFile, generateFilename, processImage, deleteFile } = require('../utils/upload');
const path = require('path');

const predict = async (request, h) => {
  let tempFilePath = null;
  let processedFilePath = null;
  
  try {
    const { prisma, auth } = request;
    const { image } = request.payload;

    // Validate image file
    if (!image) {
      return h.response({
        status: 'fail',
        message: 'Image file is required'
      }).code(400);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(image.hapi.headers['content-type'])) {
      return h.response({
        status: 'fail',
        message: 'Only JPEG and PNG images are allowed'
      }).code(400);
    }

    // Generate filename and save uploaded file
    const originalFilename = generateFilename(image.hapi.filename, 'temp_');
    tempFilePath = await saveUploadedFile(image, originalFilename);

    // Process image for ML prediction
    const processedFilename = generateFilename(image.hapi.filename, 'processed_');
    processedFilePath = path.join(path.dirname(tempFilePath), processedFilename);
    await processImage(tempFilePath, processedFilePath);

    // Run ML prediction
    const predictionResult = await mlService.predict(processedFilePath);

    // Save final image for serving
    const finalFilename = generateFilename(image.hapi.filename, 'img_');
    const finalFilePath = path.join(path.dirname(tempFilePath), finalFilename);
    await processImage(tempFilePath, finalFilePath, {
      width: 800,
      height: 600,
      quality: 85
    });

    // Save prediction to database
    const prediction = await prisma.prediction.create({
      data: {
        userId: auth.userId,
        imageUrl: `/uploads/${finalFilename}`,
        result: predictionResult.result,
        confidence: predictionResult.confidence,
        suggestions: JSON.stringify(predictionResult.suggestions)
      }
    });

    // Clean up temporary files
    if (tempFilePath) deleteFile(tempFilePath);
    if (processedFilePath) deleteFile(processedFilePath);

    return h.response({
      status: 'success',
      message: 'Prediction completed successfully',
      data: {
        id: prediction.id,
        imageUrl: prediction.imageUrl,
        result: prediction.result,
        confidence: prediction.confidence,
        suggestions: JSON.parse(prediction.suggestions),
        createdAt: prediction.createdAt,
        detailedScores: predictionResult.allScores
      }
    }).code(200);

  } catch (error) {
    console.error('Prediction error:', error);
    
    // Clean up files on error
    if (tempFilePath) deleteFile(tempFilePath);
    if (processedFilePath) deleteFile(processedFilePath);

    return h.response({
      status: 'error',
      message: error.message || 'Prediction failed'
    }).code(500);
  }
};

const getUserPredictions = async (request, h) => {
  try {
    const { prisma, auth } = request;
    const { page = 1, limit = 10 } = request.query;
    const skip = (page - 1) * limit;

    const [predictions, total] = await Promise.all([
      prisma.prediction.findMany({
        where: { userId: auth.userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          imageUrl: true,
          result: true,
          confidence: true,
          suggestions: true,
          createdAt: true
        }
      }),
      prisma.prediction.count({
        where: { userId: auth.userId }
      })
    ]);

    const formattedPredictions = predictions.map(prediction => ({
      ...prediction,
      suggestions: JSON.parse(prediction.suggestions || '[]')
    }));

    return h.response({
      status: 'success',
      data: {
        predictions: formattedPredictions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }).code(200);

  } catch (error) {
    console.error('Get predictions error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch predictions'
    }).code(500);
  }
};

const getPredictionById = async (request, h) => {
  try {
    const { prisma, auth } = request;
    const { id } = request.params;

    const prediction = await prisma.prediction.findFirst({
      where: {
        id,
        userId: auth.userId
      },
      select: {
        id: true,
        imageUrl: true,
        result: true,
        confidence: true,
        suggestions: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!prediction) {
      return h.response({
        status: 'fail',
        message: 'Prediction not found'
      }).code(404);
    }

    return h.response({
      status: 'success',
      data: {
        ...prediction,
        suggestions: JSON.parse(prediction.suggestions || '[]')
      }
    }).code(200);

  } catch (error) {
    console.error('Get prediction error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch prediction'
    }).code(500);
  }
};

const deletePrediction = async (request, h) => {
  try {
    const { prisma, auth } = request;
    const { id } = request.params;

    const prediction = await prisma.prediction.findFirst({
      where: {
        id,
        userId: auth.userId
      }
    });

    if (!prediction) {
      return h.response({
        status: 'fail',
        message: 'Prediction not found'
      }).code(404);
    }

    // Delete the image file
    if (prediction.imageUrl) {
      const imagePath = path.join(__dirname, '../../', prediction.imageUrl);
      deleteFile(imagePath);
    }

    // Delete prediction from database
    await prisma.prediction.delete({
      where: { id }
    });

    return h.response({
      status: 'success',
      message: 'Prediction deleted successfully'
    }).code(200);

  } catch (error) {
    console.error('Delete prediction error:', error);
    return h.response({
      status: 'error',
      message: 'Failed to delete prediction'
    }).code(500);
  }
};

module.exports = {
  predict,
  getUserPredictions,
  getPredictionById,
  deletePrediction
};

