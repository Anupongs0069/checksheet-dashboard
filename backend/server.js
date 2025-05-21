// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/routes/index');
const { authenticateToken } = require('./src/middlewares/authMiddleware');

const app = express();

// Debug middleware - ใส่ก่อน express.json() เพื่อดู raw request
app.use((req, res, next) => {
  if (req.url.includes('daily-check')) {
    console.log('\n=== Incoming Request ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', {
      'content-type': req.headers['content-type'],
      'origin': req.headers['origin']
    });
  }
  next();
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware - ใส่หลัง express.json() เพื่อดู parsed body
app.use((req, res, next) => {
  if (req.url.includes('daily-check')) {
    console.log('\n=== Parsed Request Body ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('=========================');
  }
  next();
});

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Mount routes
app.use('/api', userRoutes);

// Protected route example
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
      error: err.message
    });
  }
  next(err);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Allowed origins: ${corsOptions.origin}`);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});