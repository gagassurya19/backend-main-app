const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ensureUploadDir = () => {
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

const saveUploadedFile = async (file, filename) => {
  const uploadDir = ensureUploadDir();
  const filePath = path.join(uploadDir, filename);
  
  const fileStream = fs.createWriteStream(filePath);
  
  return new Promise((resolve, reject) => {
    file.pipe(fileStream);
    
    file.on('error', (error) => {
      reject(error);
    });
    
    fileStream.on('error', (error) => {
      reject(error);
    });
    
    fileStream.on('finish', () => {
      resolve(filePath);
    });
  });
};

const processImage = async (inputPath, outputPath, options = {}) => {
  const {
    width = 224,
    height = 224,
    quality = 80
  } = options;
  
  try {
    await sharp(inputPath)
      .resize(width, height, { fit: 'cover' })
      .jpeg({ quality })
      .toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

const generateFilename = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const ext = path.extname(originalName);
  return `${prefix}${timestamp}_${random}${ext}`;
};

const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  ensureUploadDir,
  saveUploadedFile,
  processImage,
  generateFilename,
  deleteFile
};

