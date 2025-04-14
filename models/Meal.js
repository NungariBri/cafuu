const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true }, // Initial admin-set rating
  image: { type: String, required: true },
  available: { type: Boolean, default: true },
  timing: [{ type: String, enum: ['breakfast', 'lunch', 'supper'] }],

  ratingsByDay: {
    monday: {
      breakfast: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      lunch: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      supper: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
    },
    tuesday: {
      breakfast: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      lunch: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      supper: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
    },
    wednesday: {
      breakfast: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      lunch: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      supper: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
    },
    thursday: {
      breakfast: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      lunch: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      supper: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
    },
    friday: {
      breakfast: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      lunch: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      supper: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
    },
    saturday: {
      breakfast: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      lunch: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      supper: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
    },
    sunday: {
      breakfast: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      lunch: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      supper: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
    }
  }
  
});

module.exports = mongoose.model('Meal', mealSchema);
