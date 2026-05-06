// src/middleware/validator.js
const { body, validationResult } = require('express-validator');

/**
 * Validate user registration input
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

/**
 * Validate user login input
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

/**
 * Validate task creation input
 */
const validateCreateTask = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['NoCategory','Work', 'Personal', 'Health', 'Finance', 'Education', 'Other']).withMessage('Category must be one of: Work, Personal, Health, Finance, Education, Other'),
    
  body('customCategory')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Custom Category must be between 1 and 50 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),

  body('task_start')
    .optional()
    .custom((value) => {
      if (isNaN(Date.parse(value))){
        throw new Error('Please provide a valid format');
      }
      return true;
    })
    .toDate(),

  body('task_due')
    .optional()
    .custom((value) => {
      if (isNaN(Date.parse(value))){
        throw new Error('Please provid a valid format');
      }
      return true;
    })
    .custom((value, { req }) => {
      if (req.body.task_start && new Date(value) <= new Date(req.body.task_start)) {
        throw new Error('Task due must be after task start');
      }
      return true;
    })
    .toDate()
];

/**
 * Validate task update input
 */
const validateUpdateTask = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  
  body('category')
    .optional()
    .isIn(['NoCategory','Work', 'Personal', 'Health', 'Finance', 'Education', 'Other']).withMessage('Category must be one of: Work, Personal, Health, Finance, Education, Other'),
    
  body('customCategory')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Custom Category must be between 1 and 50 characters'),

  body('status')
    .optional()
    .isIn(['Pending', 'Ongoing', 'In_progress', 'Completed', 'Canceled']).withMessage('Status will be Pending, Ongoing, In progress, Completed, or Canceled'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  
  body('task_start')
    .optional()
    .custom((value) => {
      if (isNaN(Date.parse(value))){
        throw new Error('Please provid a valid format');
      }
      return true;
    })
    .toDate(),
  
  body('task_due')
    .optional()
    .custom((value) => {
      if (isNaN(Date.parse(value))){
        throw new Error('Please provid a valid format');
      }
      return true;
    })
    .custom((value, { req }) => {
      if (req.body.task_start && new Date(value) <= new Date(req.body.task_start)) {
        throw new Error('Task due must be after task start');
      }
      return true;
    })
    .toDate(),

  body('progress_percentage')
    .optional()
    .isInt({min: 0, max: 100}).withMessage('Progress percetage must be between 0 and 100')
];

// validate subtask creation - subtasks can be null/optional
const validateCreateSubtask = [
  body('task_id')
    .notEmpty().withMessage('Task ID is required')
    .isInt().withMessage('Task ID must be a valid integer'),
  
  // Normalize subtasks to always be an array
  body('subtasks')
    .optional({ nullable: true })
    .customSanitizer((value) => {
      if (!value) return value;
      // Convert single object to array
      return Array.isArray(value) ? value : [value];
    })
    .custom((value) => {
      if (value && value.length === 0) {
        throw new Error('At least one subtask is required when subtasks array is provided');
      }
      return true;
    }),

  body('subtasks.*.subtask_title')
    .if(body('subtasks').exists())
    .trim()
    .notEmpty().withMessage('Subtask title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('subtasks.*.subtask_description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  
  body('subtasks.*.subtask_priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),

  body('subtasks.*.subtask_start')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && isNaN(Date.parse(value))){
        throw new Error('Please provide a valid format');
      }
      return true;
    }),

  body('subtasks.*.subtask_due')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && isNaN(Date.parse(value))){
        throw new Error('Please provide a valid format');
      }
      return true;
    })
];

// validate update subtask
const validateUpdateSubtask = [
  body('subtask_title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('subtask_description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  
  body('subtask_status')
    .optional()
    .isIn(['Pending', 'Ongoing', 'In_progress', 'Completed', 'Canceled']).withMessage('Status will be Pending, Ongoing, In progress, Completed, or Canceled'),
  
  body('subtask_priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  
  body('subtask_start')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && isNaN(Date.parse(value))){
        throw new Error('Please provid a valid format');
      }
      return true;
    })
    .toDate(),
  
  body('subtask_due')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && isNaN(Date.parse(value))){
        throw new Error('Please provid a valid format');
      }
      return true;
    })
    .custom((value, { req }) => {
      if (value && req.body.subtask_start && new Date(value) <= new Date(req.body.subtask_start)) {
        throw new Error('Subtask due must be after subtask start');
      }
      return true;
    })
    .toDate(),

  body('subtask_progress_percentage')
    .optional()
    .isInt({min: 0, max: 100}).withMessage('Subtask progress percetage must be between 0 and 100')
];

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateTask,
  validateUpdateTask,
  validateCreateSubtask,
  validateUpdateSubtask,
  handleValidationErrors
};