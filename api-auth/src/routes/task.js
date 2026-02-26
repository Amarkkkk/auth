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
  getCategories,
  getTaskStats
} = require('../controllers/task');

// Import middleware
const { protect } = require('../middleware/auth');
const {
  validateCreateTask,
  validateUpdateTask,
  handleValidationErrors
} = require('../middleware/validator');


// Apply authentication to all routes
router.use(protect);

// Statistics route (must come before /:id)
router.get('/stats', getTaskStats);
router.get('/categories', getCategories);

// Main CRUD routes
router.route('/')
  .get(getTasks)
  .post(validateCreateTask, handleValidationErrors, createTask);

router.route('/:id')
  .get(getTask)
  .put(validateUpdateTask, handleValidationErrors, updateTask)
  .delete(deleteTask);

module.exports = router;