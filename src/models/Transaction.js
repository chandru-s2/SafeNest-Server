const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('credit', 'debit'), allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  category: {
    type: DataTypes.ENUM('Food', 'Shopping', 'Transfer', 'Bills', 'ATM', 'Medical', 'Travel', 'Entertainment', 'Other'),
    defaultValue: 'Other',
  },
  counterparty: { type: DataTypes.STRING, allowNull: true },
  referenceId: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('completed', 'pending', 'failed'), defaultValue: 'completed' },
  accountType: { type: DataTypes.ENUM('savings', 'current'), defaultValue: 'savings' },
}, { tableName: 'transactions', timestamps: true });

module.exports = Transaction;
