const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define('Attendance', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'outing'),
    allowNull: false,
    defaultValue: 'present'
  },
  markedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'marked_by'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'attendances',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'date']
    }
  ]
});

module.exports = Attendance;
