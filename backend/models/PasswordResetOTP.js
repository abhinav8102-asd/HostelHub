const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PasswordResetOTP = sequelize.define('PasswordResetOTP', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  }
}, {
  tableName: 'password_reset_otps'
});

module.exports = PasswordResetOTP;
