const express = require('express');
const router = express.Router();
const unlockController = require('../controllers/unlock.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All unlock routes require authentication
router.post('/', authenticate, unlockController.unlockEpisode);
router.get('/user', authenticate, unlockController.getUserUnlocks);
router.get('/check', authenticate, unlockController.checkUnlock);

module.exports = router;
