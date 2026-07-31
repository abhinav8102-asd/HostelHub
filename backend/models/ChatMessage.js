const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'group_id'
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sender_id'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachmentUrl: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    field: 'attachment_url'
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_deleted'
  },
  deletedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'deleted_by'
  },
  deletedByName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'deleted_by_name'
  }
}, {
  tableName: 'chat_messages'
});

module.exports = ChatMessage;
