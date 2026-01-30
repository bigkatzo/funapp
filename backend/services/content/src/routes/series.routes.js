const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/series.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');

// Public routes (with optional auth)
router.get('/', optionalAuth, seriesController.listSeries);
router.get('/search', optionalAuth, seriesController.searchSeries);
router.get('/:id', optionalAuth, seriesController.getSeries);
router.get('/:id/episodes/:episodeNum', optionalAuth, seriesController.getEpisode);

// Protected routes
router.post('/:id/view', authenticate, seriesController.trackView);

module.exports = router;
