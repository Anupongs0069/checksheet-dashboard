// ./src/services/imageService.js

const fs = require('fs');
const path = require('path');
const multer = require('multer');

const qualityStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/quality-measurements/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const imageFileFilter = function(req, file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Error: File upload only supports images (jpeg, jpg, png, gif, webp)"));
};

const uploadSingleImage = multer({
  storage: qualityStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: imageFileFilter
}).single('file');

const uploadMultipleImages = multer({
  storage: qualityStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: imageFileFilter
}).array('files', 10); 

const getImageStream = async (imagePath) => {
  try {
    const fullImagePath = path.join(__dirname, '../images', imagePath);
    try {
      await fs.promises.access(fullImagePath, fs.constants.F_OK);
      return fs.createReadStream(fullImagePath);
    } catch (err) {
      const defaultImagePath = path.join(__dirname, '../images/No Image Available.webp');
      return fs.createReadStream(defaultImagePath);
    }
  } catch (error) {
    console.error('Error in getImageStream:', error);
    throw new Error('Unable to get image stream');
  }
};

const getReferenceImage = async (imageUrl) => {
  try {
    const imageBasePath = path.join(__dirname, '../images/references');
    const imageFullPath = path.join(imageBasePath, imageUrl);
    
    try {
      await fs.promises.access(imageFullPath, fs.constants.F_OK);
      
      const fileContent = await fs.promises.readFile(imageFullPath);
      
      const fileExtension = path.extname(imageUrl).toLowerCase();
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      }[fileExtension] || 'image/jpeg';
      
      return {
        success: true,
        data: {
          fileContent,
          contentType
        }
      };
    } catch (err) {
      return {
        success: false,
        message: "Reference image not found"
      };
    }
  } catch (error) {
    console.error("Error getting reference image:", error);
    throw new Error("Failed to get reference image");
  }
};

const processUploadedFiles = (files, points) => {
  if (!files || files.length === 0) return [];
  
  try {

    return files.map(file => {

      const pointNumberMatch = file.originalname.match(/point-(\d+)/);
      let pointNumber = null;
      
      if (pointNumberMatch) {
        pointNumber = parseInt(pointNumberMatch[1]);
      }
      
      return {
        pointNumber,
        file
      };
    });
  } catch (error) {
    console.error("Error processing uploaded files:", error);
    return [];
  }
};

module.exports = {
  getImageStream,
  getReferenceImage,
  uploadSingleImage,
  uploadMultipleImages,
  processUploadedFiles
};