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
});

const Food = model('Food', FoodSchema);

// Export as a property so you can destructure it in routes:
module.exports.Food = Food;
