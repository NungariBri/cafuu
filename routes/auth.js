const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { sendVerificationEmail, sendNotificationEmail } = require('../utils/mailer');

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
// 📤 Send reset code
router.post('/request-reset', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetCode = resetCode;
    user.resetCodeExpiry = expiry;
    await user.save();

    await sendVerificationEmail(email, resetCode); // reuse same function
    res.json({ message: 'Reset code sent to your email' });
  } catch (err) {
    console.error('❌ Error sending reset code:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password using email + code
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (!user.resetCode || user.resetCode !== code) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }

  if (new Date() > new Date(user.resetCodeExpiry)) {
    return res.status(400).json({ message: 'Code expired. Please request a new one.' });
  }

  user.password = newPassword;
  user.resetCode = null;
  user.resetCodeExpiry = null;
  await user.save();

  res.json({ message: 'Password reset successful! Please login again.' });
});
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    await user.save();

    await sendVerificationEmail(email, newCode);
    res.json({ message: 'Verification code resent to your email' });
  } catch (err) {
    console.error('❌ Error resending code:', err.message);
    res.status(500).json({ message: 'Server error while resending code' });
  }
});



module.exports = router;
