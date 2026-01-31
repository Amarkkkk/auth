// src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();

// Import controllers
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/task');

// Import middleware
const { protect } = require('../middleware/auth');
const {
  validateCreateTask,
  validateUpdateTask,
  handleValidationErrors
} = require('../middleware/validator');

// Debug: Check if everything is a function
console.log('=== TASK ROUTES DEBUG ===');
console.log('getTasks:', typeof getTasks);
console.log('getTask:', typeof getTask);
console.log('createTask:', typeof createTask);
console.log('updateTask:', typeof updateTask);
console.log('deleteTask:', typeof deleteTask);
console.log('getTaskStats:', typeof getTaskStats);
console.log('protect:', typeof protect);
console.log('validateCreateTask:', Array.isArray(validateCreateTask) ? 'array' : typeof validateCreateTask);
console.log('validateUpdateTask:', Array.isArray(validateUpdateTask) ? 'array' : typeof validateUpdateTask);
console.log('handleValidationErrors:', typeof handleValidationErrors);
console.log('==========================');

// Apply authentication to all routes
router.use(protect);

// Statistics route (must come before /:id)
router.get('/stats', getTaskStats);

// Main CRUD routes
router.route('/')
  .get(getTasks)
  .post(validateCreateTask, handleValidationErrors, createTask);

router.route('/:id')
  .get(getTask)
  .put(validateUpdateTask, handleValidationErrors, updateTask)
  .delete(deleteTask);

module.exports = router;