const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  complaintId: { type: DataTypes.STRING, allowNull: false, unique: true },
  category: {
    type: DataTypes.ENUM('Transaction', 'Fraud', 'Service', 'Other'),
    defaultValue: 'Other',
  },
  description: { type: DataTypes.TEXT, allowNull: false },
  referenceId: { type: DataTypes.STRING, allowNull: true },
  status: {
    type: DataTypes.ENUM('Open', 'InProgress', 'Resolved', 'Closed'),
    defaultValue: 'Open',
  },
  resolution: { type: DataTypes.TEXT, allowNull: true },
  escalationTier: { type: DataTypes.INTEGER, defaultValue: 1 },
  attachmentUrl: { type: DataTypes.STRING, allowNull: true },
}, { tableName: 'complaints', timestamps: true });

module.exports = Complaint;
