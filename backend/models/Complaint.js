const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'student_id'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  category: {
    type: DataTypes.ENUM('electrical', 'plumbing', 'carpentry', 'cleaning', 'wifi', 'others'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'resolved'),
    allowNull: false,
    defaultValue: 'pending'
  },
  wardenId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'warden_id'
  },
  staffId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'staff_id'
  },
  photoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'photo_url'
  },
  completionPhotoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'completion_photo_url'
  },
  feedbackRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    },
    field: 'feedback_rating'
  },
  feedbackComment: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'feedback_comment'
  }
}, {
  tableName: 'complaints'
});

module.exports = Complaint;
