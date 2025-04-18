const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  verificationCode: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  favorites: [{
    mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
    time: { type: String, enum: ['breakfast', 'lunch', 'supper'], required: true },
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], required: true }
  }],
  resetCode: {
    type: String
  },
  resetCodeExpiry: {
    type: Date
  }
  
  
  
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);