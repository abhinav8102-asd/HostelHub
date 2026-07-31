const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  hostelBlock: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'All',
    field: 'hostel_block'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'created_by'
  },
  photoUrl: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    field: 'photo_url'
  }
}, {
  tableName: 'announcements'
});

module.exports = Announcement;
