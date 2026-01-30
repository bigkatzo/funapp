const express = require('express');
const router = express.Router();
const statusController = require('../controllers/status.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All status routes require authentication
router.get('/:uploadId', authenticate, statusController.getStatus);
router.get('/user/uploads', authenticate, statusController.getUserUploads);
router.get('/queue/stats', authenticate, statusController.getQueueStats);

module.exports = router;
