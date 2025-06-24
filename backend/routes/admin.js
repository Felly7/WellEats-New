// routes/admin.js
const express = require('express');
const router = express.Router();

console.log('🔧 [routes/admin] loaded');

const User = require('../models/User');
const Food = require('../models/Food');

// const Category = require('../models/Category');  // ← remove or comment this out

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Unable to load users' });
  }
});

async function countActive(days) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return User.countDocuments({ lastActiveAt: { $gte: since } });
}

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.estimatedDocumentCount();
    const [dau, wau, mau, yau] = await Promise.all([
      countActive(1),
      countActive(7),
      countActive(30),
      countActive(365),
    ]);

    const topFoods = await Food.find()
      .sort({ views: -1 })
      .limit(10)
      .select('description views')
      .lean();

    res.json({
      totalUsers,
      dau,
      wau,
      mau,
      yau,
      topFoods,
      topCategories: [],  // empty until you add a Category model
    });
  } catch (err) {
    console.error('⛔️ Stats error:', err.stack);
    return res.status(500).json({ message: 'Unable to gather stats', error: err.message });
  }
});

module.exports = router;
