const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MessFeedback = sequelize.define('MessFeedback', {
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
  mealType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'meal_type'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'photo_url'
  }
}, {
  tableName: 'mess_feedbacks'
});

module.exports = MessFeedback;
