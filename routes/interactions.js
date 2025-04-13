const express = require('express');
const router = express.Router();
const Interaction = require('../models/Interaction');

// Save a new interaction
router.post('/', async (req, res) => {
  try {
    const { email, mealName } = req.body;

    if (!email || !mealName) {
      return res.status(400).json({ success: false, message: 'Email and meal name are required' });
    }

    const interaction = new Interaction({ email, mealName });
    await interaction.save();

    res.status(201).json({ success: true, message: 'Interaction saved' });
  } catch (err) {
    console.error("❌ Error saving interaction:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;