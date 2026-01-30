/**
 * Credits Controller
 * Manages user credit balance
 */

const User = require('../models/user.model');
const logger = require('../utils/logger');

/**
 * POST /api/auth/credits/add
 * Add credits to user account (called by Payment Service)
 */
exports.addCredits = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userId;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Valid credit amount is required'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    await user.addCredits(amount);
    
    logger.info(`Added ${amount} credits to user ${userId}`);
    
    res.json({
      success: true,
      credits: user.credits,
      message: `Added ${amount} credits`
    });
    
  } catch (error) {
    logger.error('Add credits error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add credits'
    });
  }
};

/**
 * POST /api/auth/credits/deduct
 * Deduct credits from user account (called by Content Service)
 */
exports.deductCredits = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userId;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Valid credit amount is required'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    try {
      await user.spendCredits(amount);
      
      logger.info(`Deducted ${amount} credits from user ${userId}`);
      
      res.json({
        success: true,
        creditsRemaining: user.credits,
        message: `Deducted ${amount} credits`
      });
    } catch (error) {
      if (error.message === 'Insufficient credits') {
        return res.status(400).json({
          error: 'Insufficient Credits',
          message: `You have ${user.credits} credits, but need ${amount}`,
          creditsAvailable: user.credits,
          creditsNeeded: amount
        });
      }
      throw error;
    }
    
  } catch (error) {
    logger.error('Deduct credits error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to deduct credits'
    });
  }
};

module.exports = exports;
