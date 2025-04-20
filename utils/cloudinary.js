const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dhm10m3mc',
  api_key: '723134667735591',
  api_secret: '3Eq61pQUekrNKGJDEeWLbBNE6uY'
});

module.exports = cloudinary;
