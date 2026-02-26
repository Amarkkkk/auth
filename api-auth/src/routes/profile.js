const express = require('express');
const router = express.Router();
const {
    upload,
    updateProfile,
    deleteProfileImage,
    getProfile
} = require('../controllers/profileImage');

const {protect} = require ('../middleware/auth');

//get user profile
router.get('/', protect, getProfile);

// update user profile with optional image upload
router.put('/', protect, upload.single('profileImage'), updateProfile);

// delete profile image
router.delete('/image', protect, deleteProfileImage);

module.exports = router;