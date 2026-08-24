const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StaffTask = sequelize.define('StaffTask', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    assignedStaffId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    hostelBlock: {
      type: DataTypes.STRING,
      defaultValue: 'All'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      defaultValue: 'pending'
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  return StaffTask;
};
