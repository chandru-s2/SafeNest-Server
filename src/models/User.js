const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    phone:         { type: String, required: true, unique: true, maxlength: 15 },
    email:         { type: String, default: null },
    name:          { type: String, required: true, default: 'SafeNest User' },
    accountNumber: { type: String, required: true, maxlength: 20 },
    pinHash:       { type: String, default: null },
    otpCode:       { type: String, default: null },
    otpExpiry:     { type: Date,   default: null },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
