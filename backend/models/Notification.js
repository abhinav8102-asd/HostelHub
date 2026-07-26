const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_read'
  },
  type: {
    type: DataTypes.ENUM('complaint_update', 'announcement', 'assignment'),
    allowNull: false
  }
}, {
  tableName: 'notifications'
});

module.exports = Notification;
