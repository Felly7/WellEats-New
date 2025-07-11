const express = require('express');
const { register, login, getUserData } = require('../controllers/authControllers');
const { protect} = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getUserData)

module.exports = router;
