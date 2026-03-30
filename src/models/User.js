const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  phone: { type: DataTypes.STRING(15), allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: true },
  name: { type: DataTypes.STRING, allowNull: false, defaultValue: 'SafeNest User' },
  accountNumber: { type: DataTypes.STRING(20), allowNull: false },
  pinHash: { type: DataTypes.STRING, allowNull: true },
  otpCode: { type: DataTypes.STRING(6), allowNull: true },
  otpExpiry: { type: DataTypes.DATE, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'users', timestamps: true });

module.exports = User;
