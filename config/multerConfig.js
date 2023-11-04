const e = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs').promises;

// Multer configuration

const storage = multer.memoryStorage(); 
const imageFields = [
  { name: 'img-1', maxCount: 1 },
  { name: 'img-2', maxCount: 1 },
  { name: 'img-3', maxCount: 1 },
  { name: 'img-4', maxCount: 1 }
];

const upload = multer({ storage: storage }).fields(imageFields);
const processImages = async (req, res, next) => {
  try {
    if (req.files) {
      const processedImages = {};

      for (const key in req.files) {
        const file = req.files[key][0];
        const metadata = await sharp(file.buffer).metadata();
        const desiredWidth = 800;
        const desiredHeight = Math.round((metadata.height / metadata.width) * desiredWidth);
        
        const processedImageBuffer = await sharp(file.buffer)
          .resize({ width: desiredWidth, height: desiredHeight, fit: 'inside' })
          .webp()
          .toBuffer();

        if (req.method === 'PATCH') {
            processedImages[key] = processedImageBuffer;
        }else{
           const imagePath = `${Date.now()}-processed.webp`;
           await fs.writeFile('uploads/' + imagePath, processedImageBuffer);
           processedImages[key] = imagePath;
        }  
      }
      req.body.images = processedImages;
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, processImages };


/*const storage = multer.diskStorage(
    {
    destination: function (req, file, cb) {
       cb(null, 'uploads/'); // Specify the directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
      const name = `${Date.now()}` +file.originalname;
      cb(null, name); // Specify a unique filename for the uploaded file
    }
});*/