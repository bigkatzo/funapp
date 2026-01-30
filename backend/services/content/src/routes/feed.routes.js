const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

// Feed route with optional auth (personalized if authenticated)
router.get('/', optionalAuth, feedController.getFeed);

module.exports = router;
