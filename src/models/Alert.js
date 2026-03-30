const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  type: {
    type: DataTypes.ENUM('Fraud', 'Spending', 'Tips', 'System'),
    defaultValue: 'System',
  },
  message: { type: DataTypes.TEXT, allowNull: false },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'low',
  },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  ts: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'alerts', timestamps: true });

module.exports = Alert;
