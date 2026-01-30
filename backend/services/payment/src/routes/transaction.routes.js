const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All transaction routes require authentication
router.get('/', authenticate, transactionController.getTransactions);
router.get('/:id', authenticate, transactionController.getTransaction);

module.exports = router;
