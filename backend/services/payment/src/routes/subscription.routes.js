const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All subscription routes require authentication
router.post('/create', authenticate, subscriptionController.createSubscription);
router.post('/cancel', authenticate, subscriptionController.cancelSubscription);
router.get('/status', authenticate, subscriptionController.getStatus);
router.get('/products', subscriptionController.getProducts); // Public

module.exports = router;
