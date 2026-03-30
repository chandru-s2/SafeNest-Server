const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    complaintId:   { type: String, required: true, unique: true },
    category:      {
      type: String,
      enum: ['Transaction', 'Fraud', 'Service', 'Other'],
      default: 'Other',
    },
    description:   { type: String, required: true },
    referenceId:   { type: String, default: null },
    status:        {
      type: String,
      enum: ['Open', 'InProgress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    resolution:    { type: String, default: null },
    escalationTier: { type: Number, default: 1 },
    attachmentUrl: { type: String, default: null },
  },
  { timestamps: true }
);

ComplaintSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Complaint', ComplaintSchema);
