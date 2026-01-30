const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// Webhook route (no auth, verified by Stripe signature)
router.post('/stripe', webhookController.handleStripeWebhook);

module.exports = router;
