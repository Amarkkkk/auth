// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

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
            error: process.env.NODE_ENV === 'production' ? error.message : undefined  // ✅ Fixed: was node_env
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
                    email: user.email
                },
                token
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: process.env.NODE_ENV === 'production' ? error.message : undefined  // ✅ Fixed
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
            error: process.env.NODE_ENV === 'production' ? error.message : undefined  // ✅ Fixed
        });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/update-profile
 * @access  Private (requires authentication)
 */
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;  // ✅ Changed username to name
        
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Update user fields if provided
        if (name) user.name = name;     // ✅ Changed username to name
        if (email) user.email = email;

        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
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
            error: process.env.NODE_ENV === 'production' ? error.message : undefined  // ✅ Fixed
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
        const { currentPassword, newPassword } = req.body;
        
        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }
        
        // Get user with password
        const user = await User.findByPk(req.user.id);
        
        // Verify current password
        const isPasswordValid = await user.matchPassword(currentPassword);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        
        // Update to new password (will be hashed via model hook)
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
        
    } catch (error) {
        console.error('Change Password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: process.env.NODE_ENV === 'production' ? error.message : undefined  // ✅ Fixed
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword
};