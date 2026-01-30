const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interaction.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All interaction routes require authentication
router.post('/series/:id/like', authenticate, interactionController.toggleLike);
router.post('/series/:id/favorite', authenticate, interactionController.toggleFavorite);
router.get('/favorites', authenticate, interactionController.getFavorites);
router.post('/comments', authenticate, interactionController.addComment);
router.get('/comments/:seriesId', interactionController.getComments); // Public
router.delete('/comments/:id', authenticate, interactionController.deleteComment);

module.exports = router;
