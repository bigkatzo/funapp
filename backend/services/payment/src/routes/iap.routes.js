const express = require('express');
const router = express.Router();
const iapController = require('../controllers/iap.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All IAP routes require authentication
router.post('/verify/apple', authenticate, iapController.verifyAppleReceipt);
router.post('/verify/google', authenticate, iapController.verifyGooglePurchase);

module.exports = router;
