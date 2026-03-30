const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const transactionsController = require('../controllers/transactionsController');

// GET /v1/transactions
router.get('/', auth, transactionsController.listTransactions);

// GET /v1/transactions/recent
router.get('/recent', auth, transactionsController.getRecentTransactions);

// GET /v1/transactions/:id
router.get('/:id', auth, transactionsController.getTransaction);

// POST /v1/transactions/send
router.post('/send', auth, transactionsController.sendMoney);


module.exports = router;
