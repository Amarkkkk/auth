// src/routes/subtaskRoutes.js
const express = require('express');
const router = express.Router();

// Import controllers
const {
  getSubtasks,
  getSubtask,
  getRecycledSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  restoreSubtask,
  getSubtaskStats
} = require('../controllers/subtask');

// Import middleware
const { protect } = require('../middleware/auth');
const {
  validateCreateSubtask,
  validateUpdateSubtask,
  handleValidationErrors
} = require('../middleware/validator');


// Apply authentication to all routes
router.use(protect);

// Statistics route (must come before /:id)
router.get('/stats', getSubtaskStats);
router.get('/recycle-bin', getRecycledSubtasks);
router.patch('/restore/:id', restoreSubtask); // New route for restoring a soft-deleted subtask
// Main CRUD routes
router.route('/')
  .get(getSubtasks)
  .post(validateCreateSubtask, handleValidationErrors, createSubtask);

router.route('/:id')
  .get(getSubtask)
  .put(validateUpdateSubtask, handleValidationErrors, updateSubtask)
  .delete(deleteSubtask);

module.exports = router;