const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const path = require('path')
const healthProfileRoutes = require('./routes/healthProfile');



dotenv.config();

const app = express();

// Connect to database
connectDB();
app.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/health-profile', healthProfileRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
