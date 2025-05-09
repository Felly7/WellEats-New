const mongoose = require('mongoose');
const { Schema } = mongoose;

// Enumerations of allowed values (you can expand these lists)
const ALLERGIES = ['peanuts','tree_nuts','shellfish','dairy','gluten','soy','eggs'];
const CONDITIONS = ['diabetes','hypertension','kidney_disease','celiac','ibs','none'];
const DIETARY = ['vegetarian','vegan','low_sodium','low_carb','gluten_free','none'];

const HealthProfileSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  allergies: { 
    type: [String], 
    enum: ALLERGIES, 
    default: [] 
  },
  conditions: { 
    type: [String], 
    enum: CONDITIONS, 
    default: [] 
  },
  dietaryRestrictions: { 
    type: [String], 
    enum: DIETARY, 
    default: [] 
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true  // adds createdAt / updatedAt
});

module.exports = mongoose.model('HealthProfile', HealthProfileSchema);
// This model defines the structure of the health profile data in the database.
// It includes fields for userId, allergies, conditions, dietary restrictions, and notes.