const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const agentsController = require('../controllers/agentsController');

// GET /v1/agents/escalation/analyse  (used by escalationService)
router.get('/escalation/analyse', auth, agentsController.analyse);

module.exports = router;
