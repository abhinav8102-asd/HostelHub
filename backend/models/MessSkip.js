const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MessSkip = sequelize.define('MessSkip', {
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
    type: DataTypes.ENUM('breakfast', 'lunch', 'dinner'),
    allowNull: false,
    field: 'meal_type'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'mess_skips',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'meal_type', 'date']
    }
  ]
});

module.exports = MessSkip;
