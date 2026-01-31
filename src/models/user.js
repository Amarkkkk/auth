// src/models/User.js
const { DataTypes } = require('sequelize');
const bcryptjs = require('bcrypt');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Name is required'
      },
      len: {
        args: [2, 50],
        msg: 'Name must be between 2 and 50 characters'
      }
    }
  },
  
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Email already exists'
    },
    validate: {
      notEmpty: {
        msg: 'Email is required'
      },
      isEmail: {
        msg: 'Please provide a valid email'
      }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase());
    }
  },
  
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Password is required'
      },
      len: {
        args: [6],
        msg: 'Password must be at least 6 characters'
      }
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

// Add hooks AFTER model definition (not inside define options)
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(user.password, salt);
  }
});

// Instance methods
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;