const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const User = require('../models/User');
const mailer = require('../utils/mailer');

const { sendNotificationEmail } = require('../utils/mailer');
 // ✅ Fix: require the entire module
 function getCurrentDay() {
  return new Date().toLocaleDateString('en-KE', { weekday: 'long' }).toLowerCase();
}

function getCurrentSlot() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour <= 22) return 'supper';
  return null;
}




const upload = require('../utils/cloudinaryStorage'); // adjust the path if needed

// Import the Meal model (assuming it's in a separate file)
const Meal = require('../models/Meal'); // Adjust the path if needed

// Route to handle meal uploads (POST request)
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // 1. File Upload Handling (using multer)
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    const imagePath = req.file.path || req.file.secure_url;

    // 2. Data Extraction
    const { name, price, rating, timing } = req.body;
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
    let parsedTiming;
    try {
      parsedTiming = JSON.parse(timing);
      if (!Array.isArray(parsedTiming)) throw new Error();
    } catch {
      parsedTiming = [timing]; // fallback to a single-item array
    }
    
    // Flatten any inner arrays and filter invalid strings
    parsedTiming = parsedTiming.flat().filter(
      t => typeof t === "string" && ["breakfast", "lunch", "supper"].includes(t)
    );
    console.log("✅ Final parsedTiming:", parsedTiming);

    

    const newMeal = new Meal({
      name,
      price: parsedPrice,
      rating: parsedRating,
      image: imagePath, // Store the image path in the database
      available: true,
      timing: parsedTiming
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
    if (updatedMeal.available) {
      const interestedUsers = await User.find({
        favorites: {
          $elemMatch: {
            mealId: updatedMeal._id
          }
        },
        isVerified: true
      });
    
      interestedUsers.forEach(user => {
        mailer.sendNotificationEmail(
          user.email,
          `🍽 ${updatedMeal.name} is now available for ${getCurrentSlot()} on ${getCurrentDay()}!`
        ).catch(err => {
          console.error(`❌ Failed to notify ${user.email}:`, err.message);
        });
      });
      
    }

    

    

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

// 📊 Rate a meal with day + time logic
router.post('/rate', async (req, res) => {
  try {
    const { mealId, rating } = req.body;

    if (!mealId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Invalid input' });
    }

    const meal = await Meal.findById(mealId);
    if (!meal) {
      return res.status(404).json({ success: false, error: 'Meal not found' });
    }

    // ⏰ Detect time of day
    const now = new Date();
    const hour = now.getHours();

    let timeSlot = '';
    if (hour >= 6 && hour < 11) {
      timeSlot = 'breakfast';
    } else if (hour >= 11 && hour < 16) {
      timeSlot = 'lunch';
    } else if (hour >= 16 && hour <= 22) {
      timeSlot = 'supper';
    } else {
      return res.status(400).json({ success: false, error: 'Not within cafeteria hours.' });
    }

    // 📅 Get day of week (e.g. "monday")
    const weekday = now.toLocaleDateString('en-KE', { weekday: 'long' }).toLowerCase();

    // ⏱️ Target path: meal.ratingsByDay[weekday][timeSlot]
    const current = meal.ratingsByDay?.[weekday]?.[timeSlot];
    if (!current) return res.status(400).json({ success: false, error: 'Invalid rating slot' });

    const newCount = current.count + 1;
    const newAvg = ((current.average * current.count) + rating) / newCount;

    meal.ratingsByDay[weekday][timeSlot].count = newCount;
    meal.ratingsByDay[weekday][timeSlot].average = newAvg;

    await meal.save();
    // inside /rate route, after meal.save()
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const existingIndex = user.favorites.findIndex(fav =>
        fav.mealId && fav.mealId.equals(mealId) &&
        fav.time === timeSlot &&
        fav.day === weekday
      );
          
      if (rating >= 4) {
        if (existingIndex === -1) {
          user.favorites.push({ mealId, time: timeSlot, day: weekday });
        }
        // no action needed if it already exists
      } else {
        if (existingIndex !== -1) {
          user.favorites.splice(existingIndex, 1);
        }
      }
    
      await user.save();
    }
      
  


    res.json({
      success: true,
      message: `Rated ${rating} for ${timeSlot} on ${weekday}`,
      updated: meal.ratingsByDay[weekday][timeSlot]
    });

  } catch (err) {
    console.error('❌ Error rating meal:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
// 📬 Notify users about leftovers
router.post('/notify-leftovers/:id', async (req, res) => {
  try {
    const mealId = req.params.id;
    const meal = await Meal.findById(mealId);
    if (!meal) return res.status(404).json({ message: 'Meal not found' });

    const now = new Date();
    const hour = now.getHours();
    let slot = '';
    if (hour >= 6 && hour < 11) slot = 'breakfast';
    else if (hour >= 11 && hour < 16) slot = 'lunch';
    else if (hour >= 16 && hour <= 22) slot = 'supper';
    else return res.status(400).json({ message: 'Outside meal hours' });

    const day = now.toLocaleDateString('en-KE', { weekday: 'long' }).toLowerCase();

    const users = await User.find({
      isVerified: true,
      favorites: {
        $elemMatch: {
          mealId: meal._id,
          time: slot,
          day: day
        }
      }
    });

    let notified = 0;
    for (const user of users) {
      try {
        await mailer.sendNotificationEmail(
          user.email,
          `🍽 ${meal.name} is still available after ${slot} on ${day}. Grab your leftovers now!`
        );
        notified++;
      } catch (err) {
        console.error(`❌ Could not notify ${user.email}:`, err.message);
      }
    }

    res.json({ message: 'Leftover notifications sent', notified });
  } catch (err) {
    console.error('❌ Error notifying leftovers:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
