// models/Category.js
const { Schema, model } = require('mongoose');

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  // Optional: add any other fields you need, for example:
  // description: String,
  // iconUrl: String,
}, {
  timestamps: true,  // adds createdAt and updatedAt
});

module.exports = model('Category', CategorySchema);
