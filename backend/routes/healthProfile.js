const express = require('express');
const router = express.Router();
const HealthProfile = require('../models/HealthProfile');
const {protect} = require('../middleware/auth'); //  JWT/protect middleware

// GET /api/health-profile
router.get('/', protect, async (req, res) => {
  try {
    const profile = await HealthProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/health-profile  (upsert)
router.post('/', protect, async (req, res) => {
  const { allergies, conditions, dietaryRestrictions, notes } = req.body;
  try {
    let profile = await HealthProfile.findOne({ userId: req.user.id });

    if (profile) {
      // update existing
      profile.allergies = allergies;
      profile.conditions = conditions;
      profile.dietaryRestrictions = dietaryRestrictions;
      profile.notes = notes;
    } else {
      // create new
      profile = new HealthProfile({
        userId: req.user.id,
        allergies,
        conditions,
        dietaryRestrictions,
        notes
      });
    }

    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error(err);
    // validation errors will have err.name === 'ValidationError'
    res.status(err.name === 'ValidationError' ? 400 : 500)
       .json({ error: err.message });
  }
});

module.exports = router;
// This code defines the routes for managing health profiles.
// It includes a GET route to fetch the profile and a POST route to create or update the profile.