const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:     { type: String, enum: ['Fraud', 'Spending', 'Tips', 'System'], default: 'System' },
    message:  { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    read:     { type: Boolean, default: false },
    ts:       { type: String, required: true },
  },
  { timestamps: true }
);

AlertSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', AlertSchema);
