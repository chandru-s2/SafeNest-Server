const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const profileController = require('../controllers/profileController');

// GET /v1/profile
router.get('/', auth, profileController.getProfile);

// PUT /v1/profile
router.put('/', auth, profileController.updateProfile);

module.exports = router;
