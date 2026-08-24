const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    actorId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    actorName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actorRole: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actionType: {
      type: DataTypes.STRING, // e.g. complaint_create, complaint_assign, complaint_resolve, user_status_change
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  });

  return ActivityLog;
};
