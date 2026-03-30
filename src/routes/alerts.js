const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const alertsController = require('../controllers/alertsController');

// GET /v1/alerts
router.get('/', auth, alertsController.listAlerts);

// PUT /v1/alerts/:id/read
router.put('/:id/read', auth, alertsController.markRead);

module.exports = router;
