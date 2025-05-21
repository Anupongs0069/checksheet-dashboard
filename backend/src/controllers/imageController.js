// ./src/controllers/imageController.js

const imageService = require('../services/imageService');

const getImage = async (req, res) => {
  try {
    const requestedImagePath = req.params.imagePath;
    const imageStream = await imageService.getImageStream(requestedImagePath);
    const fileExtension = requestedImagePath.split('.').pop().toLowerCase();
    const contentTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    };
    res.set('Content-Type', contentTypes[fileExtension] || 'image/jpeg');
    imageStream.pipe(res);
  } catch (error) {
    console.error('Error getting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get image',
      error: error.message
    });
  }
};

const getReferenceImage = async (req, res) => {
  try {
    const { imageUrl } = req.params;
    const result = await imageService.getReferenceImage(imageUrl);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.set('Content-Type', result.data.contentType);
    return res.send(result.data.fileContent);
  } catch (error) {
    console.error("Error getting reference image:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get reference image",
      error: error.message
    });
  }
};

const uploadFile = async (req, res, next) => {
  imageService.uploadSingleImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!next) {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          originalname: req.file.originalname,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size
        }
      });
    }
    
    next();
  });
};

const uploadFiles = async (req, res, next) => {
  imageService.uploadMultipleImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (req.files && req.files.length > 0 && req.body.points) {
      try {
        const points = typeof req.body.points === 'string' ? 
          JSON.parse(req.body.points) : req.body.points;
          
        req.files = imageService.processUploadedFiles(req.files, points);
      } catch (error) {
        console.error("Error processing files:", error);
      }
    }
    
    if (!next) {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded"
        });
      }
      
      return res.status(200).json({
        success: true,
        data: req.files.map(file => ({
          originalname: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size
        }))
      });
    }
    
    next();
  });
};

module.exports = {
  getImage,
  getReferenceImage,
  uploadFile,
  uploadFiles
};