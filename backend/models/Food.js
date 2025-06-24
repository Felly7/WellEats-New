// models/Food.js
const { Schema, model } = require('mongoose');

const FoodSchema = new Schema({
  fdcId:       { type: Number, unique: true },
  description: String,
  nutrients: {
    calories: Number,
    protein:  Number,
    fat:      Number,
    sodium:   Number,
    sugars:   Number,
  },
  views: { type: Number, default: 0 },
});

// **Default export** the model, not an object property
module.exports = model('Food', FoodSchema);
