const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
  {
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    savingsBalance: { type: Number, default: 0.0 },
    currentBalance: { type: Number, default: 0.0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', AccountSchema);
