// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const allowedOrigins = [
  'https://your-frontend-url.vercel.app',
  'http://localhost:3000' // for local dev
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'production') {
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