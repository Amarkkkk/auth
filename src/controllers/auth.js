// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const { User, Otp } = require('../models');
const {sendOTPEmail, sendWelcomeEmail} = require('../services/emailService');

/**
 * Generate JWT token for authenticated user
 * Creates signed token with user ID
 */
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,      // ✅ Fixed: was secretKey
        { expiresIn: process.env.JWT_EXPIRE }  // ✅ Fixed: was expiration_time
    );
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;  // ✅ Changed username to name
        
        // Check if user exists
        const existingUser = await User.findOne({
            where: { email }
        });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }
        
        // Create user (password will be hashed automatically via model hook)
        const user = await User.create({
            name,      // ✅ Changed username to name
            email,
            password
        });
        // welcome email
        sendWelcomeEmail(email, name).catch(err => 
            console.error('Welcome email error:', err)
        );
        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({  // ✅ Fixed: was req.status (CRITICAL BUG!)
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    name: user.name,     // ✅ Changed username to name
                    email: user.email,
                    bio: user.bio,
                    phone: user.phone,
                    profileImageUrl: user.profileImageUrl,            
                    createdAt: user.createdAt  // ✅ Fixed: was created_at
                },
                token
            }
        });
        
    } catch (error) {
        console.error('Register error:', error);
        
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        
        // Handle Sequelize unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: process.env.NODE_ENV === 'development' /*'production'*/ ? error.message : undefined  // ✅ Fixed: was node_env
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({
            where: { email }
        });
        
        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Verify password
        const isPasswordValid = await user.matchPassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Generate token
        const token = generateToken(user.id);
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    name: user.name,     // ✅ Changed username to name
                    email: user.email,
                    profileImageUrl: user.profileImageUrl
                },
                token
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: process.env.NODE_ENV === 'development' /*'production'*/ ? error.message : undefined  // ✅ Fixed
        });
    }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private (requires authentication)
 */
const getMe = async (req, res) => {
    try {
        // req.user is set in the auth middleware after token verification
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,     // ✅ Changed username to name
                    email: user.email,
                    bio: user.bio,
                    phone: user.phone,
                    profileImageUrl: user.profileImageUrl,
                    createdAt: user.createdAt,    // ✅ Fixed: was created_at
                    updatedAt: user.updatedAt     // ✅ Fixed: was update_at
                }
            }
        });
        
    } catch (error) {
        console.error('Get Me error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: process.env.NODE_ENV === 'development' /*'production'*/ ? error.message : undefined  // ✅ Fixed
        });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/update-profile
 * @access  Private (requires authentication)
 */
const updateUser = async (req, res) => {
    try {
        const { email } = req.body;  // ✅ Changed username to name
        
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Update user fields if provided        
        if (email) user.email = email;

        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'User information updated successfully',
            data: {
                user: {
                    id: user.id,
                    name: user.name,     // ✅ Changed username to name
                    email: user.email,   // ✅ Fixed: was emailL (typo)
                    updatedAt: user.updatedAt  // ✅ Fixed: was update_at
                }
            }
        });
        
    } catch (error) {
        console.error('Update Profile error:', error);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({  // ✅ Added return
                success: false,
                message: 'Email already in use'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: process.env.NODE_ENV === 'development' /*'production'*/ ? error.message : undefined  // ✅ Fixed
        });
    }
};
const requestPasswordChangeOTP = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete any existing unused OTPs for this user
        await Otp.destroy({
            where: {
                user_id: userId,
                type: 'password_change',
                isUsed: false
            }
        });

        // Generate new OTP
        const otpCode = Otp.generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create OTP record
        await Otp.create({
            user_id: userId,
            email: user.email,
            otp: otpCode,
            type: 'password_change',
            expiresAt: expiresAt
        });

        // Send OTP email
        await sendOTPEmail(user.email, otpCode, user.name, 'password_change');

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
            data: {
                expiresAt: expiresAt
            }
        });

    } catch (error) {
        console.error('Request OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending OTP',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private (requires authentication)
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, otp } = req.body;
        
        // Validate input
        if (!currentPassword || !newPassword || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Current password, new password, and OTP are required'
            });
        }

        // Validate OTP format
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP format'
            });
        }
        
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Verify current password
        const isPasswordValid = await user.matchPassword(currentPassword);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Find OTP record
        const otpRecord = await Otp.findOne({
            where: {
                user_id: user.id,
                otp: otp,
                type: 'password_change',
                isUsed: false
            },
            order: [['createdAt', 'DESC']]
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Check if OTP has exceeded attempts
        if (otpRecord.hasExceedAttempts()) {
            return res.status(400).json({
                success: false,
                message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
            });
        }

        // Check if OTP is expired
        if (otpRecord.isExpired()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new OTP.'
            });
        }

        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();
        
        // Update password
        user.password = newPassword;
        await user.save();

        // Delete all used OTPs for this user (cleanup)
        await Otp.destroy({
            where: {
                user_id: user.id,
                isUsed: true
            }
        });

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
        
    } catch (error) {
        console.error('Change Password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// for forgot password otp send first
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user by email
        const user = await User.findOne({
            where: { email }
        });

        // Always return success even if user not found (security best practice)
        // This prevents email enumeration attacks
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset code'
            });
        }

        // Delete any existing unused password reset OTPs
        await Otp.destroy({
            where: {
                user_id: user.id,
                type: 'password_reset',
                isUsed: false
            }
        });

        // Generate new OTP
        const otpCode = Otp.generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create OTP record
        await Otp.create({
            user_id: user.id,
            email: user.email,
            otp: otpCode,
            type: 'password_reset',
            expiresAt: expiresAt
        });

        // Send OTP email
        await sendOTPEmail(user.email, otpCode, user.name, 'password_reset');

        res.status(200).json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset code',
            data: {
                expiresAt: expiresAt
            }
        });

    } catch (error) {
        console.error('Forgot Password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing password reset request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// for reseting password after otp sent
const resetPassword = async (req, res) => {
    try {
        const {email, otp, newPassword} = req.body;

        if (!email || !otp, !newPassword){
            return res.status(400).json({
                success: false,
                message: 'Email, Otp, New password are required'
            });
        }
        // Validate OTP format
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP format'
            });
        }
        // validate password length
        if (newPassword < 8){
            return res.status(400).json({
                success: false,
                message: 'Password must be atleast 8 characters'
            });
        }
        // find user by email
        const user = await User.findOne({
            where: { email }
        });
        // check if exist
        if (!user){
            return res.status(404)({
                success: false,
                message: 'Invalid OTp or Email'
            });
        }
        //find otp record
        const otpRecord = await Otp.findOne({
            where: {
                user_id: user.id,
                email: email,
                otp: otp,
                type: 'password_reset',
                isUsed: false
            },
            order: [['createdAt', 'DESC']]
        });
        // check otp record if exist
        if(!otpRecord){
            return res.status(400).json({
                success: false,
                message: 'Invalid or Expired OTP'
            });
        }
        // check if otp has exceeded attempts
        if(otpRecord.hasExceedAttempts()){
            return res.status(400).json({
                success: false,
                message: 'Maximum OTP attempts exceeded. Please request a new OTP'
            });
        }
        // check if otp is expired
        if(otpRecord.isExpired()){
            return res.status(400)({
                success: false,
                message: 'OTP has expired. Please request a new OTP'
            });
        }
        // mark otp as used
        otpRecord.isUsed = true;
        await otpRecord.save();
        // update password
        user.password = newPassword;
        await user.save();
        
        //delete all used otps
        await Otp.destroy({
            where: {
                user_id: user.id,
                type: 'password_reset',
                isUsed: true
            }
        });

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now Login with your new password.'
        });
    } catch (error){
        console.error('Password reseting error: ', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
/**
 * @desc    Request OTP for email change verification
 * @route   POST /api/auth/request-email-change-otp
 * @access  Private
 */
const requestEmailChangeOTP = async (req, res) => {
    try {
        const { newEmail } = req.body;
        const userId = req.user.id;
        
        if (!newEmail) {
            return res.status(400).json({
                success: false,
                message: 'New email is required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Check if new email already exists
        const existingUser = await User.findOne({
            where: { email: newEmail }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already in use'
            });
        }

        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete any existing unused email verification OTPs for this user
        await Otp.destroy({
            where: {
                user_id: userId,
                type: 'email_verification',
                isUsed: false
            }
        });

        // Generate new OTP
        const otpCode = Otp.generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create OTP record with the NEW email
        await Otp.create({
            user_id: userId,
            email: newEmail, // Store new email in OTP record
            otp: otpCode,
            type: 'email_verification',
            expiresAt: expiresAt
        });

        // Send OTP to the NEW email address
        await sendOTPEmail(newEmail, otpCode, user.name, 'email_verification');

        res.status(200).json({
            success: true,
            message: `Verification code sent to ${newEmail}. Please check your inbox.`,
            data: {
                newEmail: newEmail,
                expiresAt: expiresAt
            }
        });

    } catch (error) {
        console.error('Request Email Change OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending verification code',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Verify OTP and change email
 * @route   PUT /api/auth/verify-email-change
 * @access  Private
 */
const verifyEmailChange = async (req, res) => {
    try {
        const { newEmail, otp } = req.body;
        const userId = req.user.id;
        
        // Validate input
        if (!newEmail || !otp) {
            return res.status(400).json({
                success: false,
                message: 'New email and OTP are required'
            });
        }

        // Validate OTP format
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP format'
            });
        }

        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if new email already exists (double check)
        const existingUser = await User.findOne({
            where: { email: newEmail }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already in use'
            });
        }

        // Find OTP record
        const otpRecord = await Otp.findOne({
            where: {
                user_id: userId,
                email: newEmail, // Must match the new email
                otp: otp,
                type: 'email_verification',
                isUsed: false
            },
            order: [['createdAt', 'DESC']]
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Check if OTP has exceeded attempts
        if (otpRecord.hasExceedAttempts()) {
            return res.status(400).json({
                success: false,
                message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
            });
        }

        // Check if OTP is expired
        if (otpRecord.isExpired()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new OTP.'
            });
        }

        // Store old email for response
        const oldEmail = user.email;

        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();
        
        // Update email
        user.email = newEmail;
        await user.save();

        // Delete all used email verification OTPs for this user
        await Otp.destroy({
            where: {
                user_id: user.id,
                type: 'email_verification',
                isUsed: true
            }
        });

        res.status(200).json({
            success: true,
            message: 'Email updated successfully',
            data: {
                oldEmail: oldEmail,
                newEmail: newEmail
            }
        });
        
    } catch (error) {
        console.error('Verify Email Change error:', error);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Email already in use'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error updating email',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'OTP is required'
            });
        }

        const otpRecord = await Otp.findOne({
            where: {
                userId: req.user.id,
                otp: otp,
                type: 'password_change',
                isUsed: false
            },
            order: [['createdAt', 'DESC']]
        });

        if (!otpRecord) {
            // Increment attempts if OTP exists
            const existingOtp = await Otp.findOne({
                where: {
                    userId: req.user.id,
                    type: 'password_change',
                    isUsed: false
                },
                order: [['createdAt', 'DESC']]
            });

            if (existingOtp) {
                existingOtp.attempts += 1;
                await existingOtp.save();
            }

            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        if (otpRecord.hasExceededAttempts()) {
            return res.status(400).json({
                success: false,
                message: 'Maximum attempts exceeded'
            });
        }

        if (otpRecord.isExpired()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateUser,
    requestPasswordChangeOTP,
    changePassword,
    forgotPassword,
    resetPassword,
    requestEmailChangeOTP,
    verifyEmailChange,
    verifyOTP
};