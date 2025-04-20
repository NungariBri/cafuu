const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('./cloudinary'); // assuming your config file is named cloudinary.js

// Set up the storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cafeteria-meals', // optional folder name in your Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // optional
  },
});

// Export multer upload middleware
module.exports = multer({ storage });
