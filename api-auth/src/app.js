// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: [
        'https://api-frontend-five-fawn.vercel.app/', // your Vercel frontend URL
        'http://localhost:3000' // optional: for local development
    ],
    credentials: true // if you send cookies or auth headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Task Management API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      tasks: '/api/tasks'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// DEBUG: Check what's being imported
console.log('📦 Importing routes...');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');

console.log('🔍 authRoutes type:', typeof authRoutes);
console.log('🔍 authRoutes is function?', typeof authRoutes === 'function');
console.log('🔍 taskRoutes type:', typeof taskRoutes);
console.log('🔍 taskRoutes is function?', typeof taskRoutes === 'function');

if (typeof authRoutes !== 'function') {
  console.error('❌ ERROR: authRoutes is not a function!');
  console.error('authRoutes value:', authRoutes);
}

if (typeof taskRoutes !== 'function') {
  console.error('❌ ERROR: taskRoutes is not a function!');
  console.error('taskRoutes value:', taskRoutes);
}

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Error handling
const { notFound, errorHandler } = require('./middleware/errorHandler');

app.use(notFound);
app.use(errorHandler);

module.exports = app;