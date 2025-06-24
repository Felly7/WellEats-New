// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Mount all routes
app.use('/api/auth',   require('./routes/authRoutes'));
app.use('/api/foods',  require('./routes/foods'));
app.use('/api/health-profile', require('./routes/healthProfile'));
console.log('🔗 Mounting /api/admin →', require.resolve('./routes/admin'));
app.use('/api/admin',  require('./routes/admin'));  

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
