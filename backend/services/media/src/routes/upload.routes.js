const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All upload routes require authentication
router.post('/init', authenticate, uploadController.initUpload);
router.post('/complete', authenticate, uploadController.completeUpload);
router.post('/multipart/init', authenticate, uploadController.initMultipartUpload);
router.delete('/:uploadId', authenticate, uploadController.cancelUpload);

module.exports = router;
