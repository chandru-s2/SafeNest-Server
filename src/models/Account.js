const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Account = sequelize.define('Account', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  savingsBalance: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  currentBalance: { type: DataTypes.FLOAT, defaultValue: 0.0 },
}, { tableName: 'accounts', timestamps: true });

module.exports = Account;
