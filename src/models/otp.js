const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');

const Otp = sequelize.define('Otp', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    otp: {
        type: DataTypes.STRING(6),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('password_change', 'email_verification', 'password_reset'),
        allowNull: false,
        defaultValue: 'password_change'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,        
    },
    isUsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,        
    },
    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            max: {
                args: 5,
                msg: 'Maximum attempts exceeded'
            }
        }
    }
}, {
    tableName: 'otps',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['user_id']
        }, {
            fields: ['email']
        }, {
            fields: ['otp']
        }
    ]
});

// generate random 6 digit otp 
Otp.generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// check otp if expired
Otp.prototype.isExpired = function() {
    return new Date() > this.expiresAt;
};

// check otp attempts
Otp.prototype.hasExceedAttempts = function() {
    return this.attempts >= 5;
};

module.exports = Otp;