const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// GET /v1/dashboard
router.get('/', auth, dashboardController.getDashboard);

module.exports = router;
