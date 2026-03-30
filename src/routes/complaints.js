const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const complaintsController = require('../controllers/complaintsController');

// GET /v1/complaints
router.get('/', auth, complaintsController.listComplaints);

// GET /v1/complaints/:id
router.get('/:id', auth, complaintsController.trackComplaint);

// POST /v1/complaints
router.post('/', auth, complaintsController.createComplaint);

// PUT /v1/complaints/:id/status
router.put('/:id/status', auth, complaintsController.updateStatus);

module.exports = router;
