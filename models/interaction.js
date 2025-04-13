const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  mealName: {
    type: String,
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interaction', interactionSchema);