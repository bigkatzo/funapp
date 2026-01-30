/**
 * Auth Routes
 * API endpoints for authentication
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const creditsController = require('../controllers/credits.controller');
const premiumController = require('../controllers/premium.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { rateLimiter } = require('../middleware/ratelimit.middleware');

// Public routes
router.post('/signup', rateLimiter(5, 15 * 60), authController.signup);
router.post('/login', rateLimiter(5, 15 * 60), authController.login);
router.post('/refresh', rateLimiter(10, 15 * 60), authController.refresh);

// Protected routes (require authentication)
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);
router.delete('/account', authenticate, authController.deleteAccount);

// Credits management (called by Payment Service)
router.post('/credits/add', authenticate, creditsController.addCredits);
router.post('/credits/deduct', authenticate, creditsController.deductCredits);

// Premium management (called by Payment Service)
router.post('/premium/activate', authenticate, premiumController.activatePremium);
router.post('/premium/extend', authenticate, premiumController.extendPremium);
router.post('/premium/deactivate', authenticate, premiumController.deactivatePremium);
router.get('/premium/status', authenticate, premiumController.getStatus);

module.exports = router;
