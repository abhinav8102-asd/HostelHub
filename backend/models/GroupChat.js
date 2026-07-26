const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GroupChat = sequelize.define('GroupChat', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'all'),
    allowNull: false,
    defaultValue: 'all'
  },
  batch: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'All'
  },
  hostelBlock: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'All',
    field: 'hostel_block'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'group_chats'
});

module.exports = GroupChat;
