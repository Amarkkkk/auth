// src/routes/auth.js
const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getMe,
  requestPasswordChangeOTP,
  changePassword,
  forgotPassword,
  resetPassword,
  requestEmailChangeOTP,
  verifyEmailChange,
  updateUser,
  verifyOTP
} = require('../controllers/auth');

// Import middleware
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  handleValidationErrors
} = require('../middleware/validator');

// Public routes
router.post(
  '/register',
  validateRegister,
  handleValidationErrors,
  register
);

router.post(
  '/login',
  validateLogin,
  handleValidationErrors,
  login
);

// Protected routes
router.get('/me', protect, getMe);
// update user email
router.put('/update', protect, updateUser);
// request otp for password change
router.post('/request-password-change-otp', protect, requestPasswordChangeOTP);
// verify otp
router.post('/verify-otp', protect, verifyOTP);
// changePassword with otp
router.put('/change-password', protect, changePassword);
// forgot password with otp
router.post('/forgot-password', forgotPassword);
// reset passowrd
router.post('/reset-password', resetPassword);
// update email sending otp
router.post('/request-email-change-otp', protect, requestEmailChangeOTP);
// verfy email
router.put('/verify-email-change', protect, verifyEmailChange);
// CRITICAL: Export the router
module.exports = router;