const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:        { type: String, enum: ['credit', 'debit'], required: true },
    amount:      { type: Number, required: true },
    description: { type: String, required: true },
    category:    {
      type: String,
      enum: ['Food', 'Shopping', 'Transfer', 'Bills', 'ATM', 'Medical', 'Travel', 'Entertainment', 'Other'],
      default: 'Other',
    },
    counterparty: { type: String, default: null },
    referenceId:  { type: String, default: null },
    status:       { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
    accountType:  { type: String, enum: ['savings', 'current'], default: 'savings' },
  },
  { timestamps: true }
);

// Index for fast user-specific queries
TransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
