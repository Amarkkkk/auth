// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const allowedOrigins = [
  'https://auth-nm4icj0hv-marks-projects-e20d608b.vercel.app', // your deployed frontend
  'http://localhost:3000',
  'http://localhost:5173'
];

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin like Postman or server-to-server
    if (!origin) return callback(null, true);

    if (!allowedOrigins.includes(origin)) {
      console.log('Blocked by CORS:', origin);
      return callback(new Error('CORS not allowed for this origin'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development'      /*process.env.NODE_ENV === 'production'*/) {
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
      tasks: '/api/tasks',
      subtasks: '/api/subtasks',
      progressConfirmationRoutes: '/api/progressConfirmation'
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
const subtaskRoutes = require('./routes/subtask');
const profileRoutes = require('./routes/profile');
const progressConfirmationRoutes = require('./routes/progressConfirmation');

if (typeof authRoutes !== 'function') {
  console.error('❌ ERROR: authRoutes is not a function!');
  console.error('authRoutes value:', authRoutes);
}

if (typeof taskRoutes !== 'function') {
  console.error('❌ ERROR: taskRoutes is not a function!');
  console.error('taskRoutes value:', taskRoutes);
}
if (typeof subtaskRoutes !== 'function') {
  console.error('❌ ERROR: subtaskRoutes is not a function!');
  console.error('taskRoutes value:', subtaskRoutes);
}
if (typeof profileRoutes !== 'function') {
  console.error('❌ ERROR: profileRoutes is not a function!');
  console.error('profileRoutes value:', profileRoutes);
}
if (typeof progressConfirmationRoutes !== 'function') {
  console.error('❌ ERROR: progressConfirmationRoutes is not a function!');
  console.error('progressConfirmationRoutes value:', progressConfirmationRoutes);
}


app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/subtasks', subtaskRoutes);
app.use('/api/profile', profileRoutes)
app.use('/api/progressConfirmation', progressConfirmationRoutes);

// Error handling
const { notFound, errorHandler } = require('./middleware/errorHandler');

app.use(notFound);
app.use(errorHandler);
// for android and ios, we need to export the app for serverless deployment
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port http://0.0.0.0:${PORT}`);
  });
}
module.exports = app;

