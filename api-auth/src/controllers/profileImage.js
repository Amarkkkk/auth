const {User} = require('../models');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamfier = require('streamifier');

// configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

// configure multer for mermory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5mb
    },
    fileFilter: (req, file, cb) => {
        // accept image only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb (null, true);
    }
});

const uploadToCloudinary = (fileBuffer, folder = 'profiles') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto',
                transformation: [
                    {
                        width: 500, height: 500, crop: 'limit'
                    },
                    {
                        quality: 'auto'
                    }
                ]
            },
            (error, result) => {
                if (error){
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        streamfier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

// delete from cloudinary
const deleteFromCLoudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error){
        console.error('Error deleting from clodinary:', error);
        throw error
    }
};

// extract public id from cloudinary url
const extractPublicId = (url) => {
    if (!url) return null;
    
    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;

        const publicIdParts = parts.slice(uploadIndex + 2);
        const publicIdWithExt = publicIdParts.join('/');
        const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
        return publicId;
    } catch (error){
        console.error('Error extracting public_id', error);
        return null;
    }
};

// update profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {name, bio, phone} = req.body;
        const profileImage = req.file;

        // find user
        const user = await User.findByPk(userId);

        if (!user){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // handle image upload if provided
        if (profileImage) {
            // delete image from cloudinary
            if (user.profileImageUrl){
                const oldPublicId = extractPublicId(user.profileImageUrl);
                if (oldPublicId){
                    try {
                        await deleteFromCLoudinary(oldPublicId);
                    } catch (error){
                        console.error('Error deleting old image: ', error);
                    }
                }
            }
            // upload new image to cloudinary
            const uploadResult = await uploadToCloudinary(profileImage.buffer, 'profiles');
            user.profileImage = uploadResult.secure_url;
            user.cloudinaryPublicId = uploadResult.public_id;
        }

        // upadte text field if provided
        if (name !== undefined) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (phone !== undefined) user.phone = phone;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    bio: user.bio,
                    phone: user.phone,
                    profileImageUrl: user.profileImage,
                    cloudinaryPublicId: user.cloudinaryPublicId,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    } catch (error) {
    console.error('Error updating profile:', error);
    
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
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// delete profile from cloudinary
const deleteProfileImage = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.profileImageUrl){
            return res.status(400).json({
                success: false,
                message: 'No profile image to delete'
            });
        }

        // delete from clodinary
        const publicId = extractPublicId(user.profileImageUrl);
        if (publicId){
            await deleteFromCLoudinary(publicId);
        }

        // update database
        user.profileImage = null;
        user.cloudinaryPublicId = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile image deleted successfully'
        });
    } catch (error){
        console.error('Error deleting profile image', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete profile image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

//get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: {
                exclude: ['password']
            }
        });

        if(!user){
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Fetching user profile successfully',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    bio: user.bio,
                    phone: user.phone,
                    profileImageUrl: user.profileImage,
                    cloudinaryPublicId: user.cloudinaryPublicId,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    } catch (error){
        console.error('Error deleting profile image', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
    
};

module.exports = {
    upload,
    updateProfile,
    deleteProfileImage,
    getProfile,
    uploadToCloudinary,
    deleteFromCLoudinary
};
