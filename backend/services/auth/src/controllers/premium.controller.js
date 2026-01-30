/**
 * Premium Controller
 * Manages premium subscription status
 */

const User = require('../models/user.model');
const logger = require('../utils/logger');

/**
 * POST /api/auth/premium/activate
 * Activate premium subscription
 */
exports.activatePremium = async (req, res) => {
  try {
    const { tier, expiresAt } = req.body;
    const userId = req.userId;
    
    if (!tier || !expiresAt) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Tier and expiration date are required'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    user.isPremium = true;
    user.premiumTier = tier;
    user.premiumExpiresAt = new Date(expiresAt);
    await user.save();
    
    logger.info(`Activated premium for user ${userId}: ${tier}`);
    
    res.json({
      success: true,
      isPremium: true,
      premiumTier: tier,
      premiumExpiresAt: user.premiumExpiresAt,
      message: 'Premium subscription activated'
    });
    
  } catch (error) {
    logger.error('Activate premium error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to activate premium'
    });
  }
};

/**
 * POST /api/auth/premium/extend
 * Extend premium subscription (renewal)
 */
exports.extendPremium = async (req, res) => {
  try {
    const { expiresAt } = req.body;
    const userId = req.userId || req.body.userId; // Allow service-to-service calls
    
    if (!expiresAt) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Expiration date is required'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    user.premiumExpiresAt = new Date(expiresAt);
    await user.save();
    
    logger.info(`Extended premium for user ${userId} until ${expiresAt}`);
    
    res.json({
      success: true,
      premiumExpiresAt: user.premiumExpiresAt,
      message: 'Premium subscription extended'
    });
    
  } catch (error) {
    logger.error('Extend premium error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to extend premium'
    });
  }
};

/**
 * POST /api/auth/premium/deactivate
 * Deactivate premium subscription
 */
exports.deactivatePremium = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    user.isPremium = false;
    user.premiumTier = null;
    user.premiumExpiresAt = null;
    await user.save();
    
    logger.info(`Deactivated premium for user ${userId}`);
    
    res.json({
      success: true,
      isPremium: false,
      message: 'Premium subscription deactivated'
    });
    
  } catch (error) {
    logger.error('Deactivate premium error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to deactivate premium'
    });
  }
};

/**
 * GET /api/auth/premium/status
 * Get premium status
 */
exports.getStatus = async (req, res) => {
  try {
    const user = req.user;
    
    // Check if premium has expired
    let isPremiumActive = user.isPremium;
    if (user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt < new Date()) {
      isPremiumActive = false;
    }
    
    res.json({
      isPremium: isPremiumActive,
      premiumTier: user.premiumTier,
      premiumExpiresAt: user.premiumExpiresAt
    });
    
  } catch (error) {
    logger.error('Get premium status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get premium status'
    });
  }
};

module.exports = exports;
