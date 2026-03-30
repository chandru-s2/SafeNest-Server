const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// POST /v1/auth/otp/send
router.post('/otp/send', authController.sendOtp);

// POST /v1/auth/otp/verify
router.post('/otp/verify', authController.verifyOtp);

// POST /v1/auth/email
router.post('/email', auth, authController.addEmail);

module.exports = router;
