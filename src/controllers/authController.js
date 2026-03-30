const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Account = require('../models/Account');

// Helper: generate account number
const generateAccountNumber = () => {
  return '5020' + Math.floor(100000000000 + Math.random() * 900000000000).toString();
};

// Helper: generate OTP (fixed to 123456 for demo)
const generateOtp = () => {
  return process.env.NODE_ENV === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /v1/auth/otp/send
exports.sendOtp = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'phoneNumber is required' });

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create or find user
    let user = await User.findOne({ where: { phone: phoneNumber } });
    if (!user) {
      user = await User.create({
        phone: phoneNumber,
        name: 'SafeNest User',
        accountNumber: generateAccountNumber(),
        otpCode: otp,
        otpExpiry: expiry,
      });
      // Create default accounts
      await Account.create({ userId: user.id, savingsBalance: 125000.50, currentBalance: 45000.00 });
    } else {
      await user.update({ otpCode: otp, otpExpiry: expiry });
    }

    console.log(`[Auth] OTP for ${phoneNumber}: ${otp}`);
    res.json({ success: true, message: 'OTP sent successfully', ...(process.env.NODE_ENV === 'development' && { otp }) });
  } catch (err) {
    next(err);
  }
};

// POST /v1/auth/otp/verify
exports.verifyOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) return res.status(400).json({ error: 'phoneNumber and otp are required' });

    const user = await User.findOne({ where: { phone: phoneNumber } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // In dev mode allow '123456' always
    const validOtp = process.env.NODE_ENV === 'development'
      ? (otp === '123456' || otp === user.otpCode)
      : (otp === user.otpCode && new Date() < new Date(user.otpExpiry));

    if (!validOtp) return res.status(401).json({ error: 'Incorrect or expired OTP' });

    // Clear OTP
    await user.update({ otpCode: null, otpExpiry: null });

    const payload = { userId: user.id, phone: user.phone };
    const authToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      authToken,
      refreshToken,
      user: { id: user.id, name: user.name, phone: user.phone, email: user.email, accountNumber: user.accountNumber },
    });
  } catch (err) {
    next(err);
  }
};

// POST /v1/auth/email
exports.addEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });

    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({ email });

    res.json({ success: true, message: 'Email added successfully' });
  } catch (err) {
    next(err);
  }
};
