const express = require('express');
const router = express.Router();
const creditsController = require('../controllers/credits.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All credit routes require authentication
router.post('/buy', authenticate, creditsController.buyCredits);
router.post('/spend', authenticate, creditsController.spendCredits);
router.get('/balance', authenticate, creditsController.getBalance);
router.get('/products', creditsController.getProducts); // Public

module.exports = router;
