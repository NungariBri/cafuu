const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // Store uploaded files in this directory
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName); // Generate a unique filename
  },
});

const upload = multer({ storage });

// Import the Meal model (assuming it's in a separate file)
const Meal = require('../models/Meal'); // Adjust the path if needed

// Route to handle meal uploads (POST request)
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // 1. File Upload Handling (using multer)
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    const imagePath = `/uploads/${req.file.filename}`; // Store the file path

    // 2. Data Extraction
    const { name, price, rating } = req.body;
    const parsedPrice = Number(price);
    const parsedRating = Number(rating);

    // 3. Validation
        if (!name || !price || !rating) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ success: false, message: "Invalid price. Must be a positive number." });
        }

        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ success: false, message: "Invalid rating. Must be a number between 1 and 5." });
        }


    // 4. Save to MongoDB
    const newMeal = new Meal({
      name,
      price: parsedPrice,
      rating: parsedRating,
      image: imagePath, // Store the image path in the database
      available: true
    });

    await newMeal.save();

    // 5. Send Response
    res.status(201).json({ success: true, message: 'Meal uploaded successfully!', data: newMeal });
  } catch (error) {
    // 6. Error Handling
    console.error('Error uploading meal:', error);
    res.status(500).json({ success: false, message: 'Failed to upload meal: ' + error.message });
  }
});

// Get all meals
router.get('/', async (req, res) => {
  try {
    const meals = await Meal.find();
    res.json(meals);
  } catch (error) {
    console.error("Error fetching meals", error);
    res.status(500).json({ success: false, message: "Failed to fetch meals" });
  }
});

// Update meal availability
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { available } = req.body;

  try {
    const updatedMeal = await Meal.findByIdAndUpdate(
      id,
      { available },
      { new: true } // Return the updated document
    );

    if (!updatedMeal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    res.json({
      success: true,
      message: `Meal availability updated`,
      name: updatedMeal.name,
    });
  } catch (error) {
    console.error('Error updating meal availability:', error);
    res.status(500).json({ success: false, message: 'Failed to update availability' });
  }
});

module.exports = router;
