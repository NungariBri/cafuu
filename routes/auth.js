const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendVerificationEmail = require('../utils/mailer');

// ✅ Pre-approved admin emails
const approvedAdmins = [
  'nehemiahbenajmin7@gmail.com',
  'bridgitnungarinjenga@gmail.com'
];

// 📥 Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔍 Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // 🔒 Set role: admin if email is approved, else student
    const role = approvedAdmins.includes(email) ? 'admin' : 'student';
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code


    // 🆕 Create new user
    const newUser = new User({ name, email, password, role, verificationCode, isVerified: false });
    await newUser.save();
    await sendVerificationEmail(email, verificationCode);


    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("❌ Error during registration:", err);
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
});

// 🔑 Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    // 🛑 Block unverified users
if (!user.isVerified) {
  return res.status(403).json({ message: 'Please verify your email before logging in.' });
}

    // ✅ Return login success
    res.status(200).json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});
// 🔐 Email Verification Route
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.isVerified = true;
    user.verificationCode = null; // Optional: clear code after success
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
});


module.exports = router;
