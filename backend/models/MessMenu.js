const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MessMenu = sequelize.define('MessMenu', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  dayOfWeek: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'day_of_week'
  },
  breakfast: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lunch: {
    type: DataTypes.STRING,
    allowNull: false
  },
  snacks: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Samosa & Tea / Coffee'
  },
  dinner: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'mess_menus'
});

module.exports = MessMenu;
