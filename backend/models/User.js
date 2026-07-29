const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true  // Nullable for Google OAuth users
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'google_id'
  },
  role: {
    type: DataTypes.ENUM('student', 'warden', 'staff', 'admin'),
    allowNull: false,
    defaultValue: 'student'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  roomNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'room_number'
  },
  hostelBlock: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'hostel_block'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending_verification', 'blocked'),
    allowNull: false,
    defaultValue: 'pending_verification'
  },
  profilePicUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'profile_pic_url'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: false,
    defaultValue: 'male'
  },
  batch: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Batch 2025'
  },
  rollNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'roll_number'
  }
}, {
  tableName: 'users'
});

module.exports = User;
