/**
 * Unlock Controller
 * Handles episode unlock logic (ads, credits, premium)
 */

const Series = require('../models/series.model');
const Unlock = require('../models/unlock.model');
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * POST /api/unlock
 * Unlock an episode using various methods
 */
exports.unlockEpisode = async (req, res) => {
  try {
    const { seriesId, episodeNum, method, adProof, transactionId } = req.body;
    const userId = req.userId; // From auth middleware
    
    if (!seriesId || !episodeNum || !method) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'seriesId, episodeNum, and method are required'
      });
    }
    
    // Check if already unlocked
    const existingUnlock = await Unlock.findOne({ userId, seriesId, episodeNum });
    if (existingUnlock && existingUnlock.isValid()) {
      return res.json({
        success: true,
        alreadyUnlocked: true,
        message: 'Episode already unlocked'
      });
    }
    
    // Get series and episode
    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Series not found'
      });
    }
    
    const episode = series.getEpisode(parseInt(episodeNum));
    if (!episode) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Episode not found'
      });
    }
    
    // If episode is free, auto-unlock
    if (episode.isFree) {
      const unlock = await Unlock.create({
        userId,
        seriesId,
        episodeNum,
        method: 'free'
      });
      
      return res.json({
        success: true,
        unlock,
        message: 'Episode is free'
      });
    }
    
    // Handle different unlock methods
    switch (method) {
      case 'ad':
        return await handleAdUnlock(req, res, userId, seriesId, episodeNum, adProof);
      
      case 'credits':
        return await handleCreditsUnlock(req, res, userId, seriesId, episodeNum, episode);
      
      case 'premium':
        return await handlePremiumUnlock(req, res, userId, seriesId, episodeNum, episode);
      
      case 'iap':
        return await handleIAPUnlock(req, res, userId, seriesId, episodeNum, transactionId);
      
      default:
        return res.status(400).json({
          error: 'Invalid Method',
          message: `Unlock method '${method}' is not supported`
        });
    }
    
  } catch (error) {
    logger.error('Unlock episode error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to unlock episode'
    });
  }
};

/**
 * Handle ad unlock
 */
async function handleAdUnlock(req, res, userId, seriesId, episodeNum, adProof) {
  if (!adProof) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Ad proof is required for ad unlock'
    });
  }
  
  // In production, verify ad proof with AdMob API
  // For now, accept any proof
  
  const unlock = await Unlock.create({
    userId,
    seriesId,
    episodeNum,
    method: 'ad',
    timestamp: new Date()
  });
  
  logger.info(`User ${userId} unlocked episode via ad: ${seriesId}/${episodeNum}`);
  
  res.json({
    success: true,
    unlock,
    message: 'Episode unlocked via ad'
  });
}

/**
 * Handle credits unlock
 */
async function handleCreditsUnlock(req, res, userId, seriesId, episodeNum, episode) {
  const costCredits = episode.unlockCostCredits;
  
  if (costCredits === 0) {
    return res.status(400).json({
      error: 'Invalid Unlock',
      message: 'Episode cannot be unlocked with credits'
    });
  }
  
  // Call Auth Service to check and deduct credits
  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  
  try {
    const response = await axios.post(
      `${authServiceUrl}/api/auth/credits/spend`,
      { amount: costCredits },
      { headers: { Authorization: req.headers.authorization } }
    );
    
    if (!response.data.success) {
      return res.status(400).json({
        error: 'Insufficient Credits',
        message: 'Not enough credits to unlock this episode'
      });
    }
    
    const unlock = await Unlock.create({
      userId,
      seriesId,
      episodeNum,
      method: 'credits',
      creditsSpent: costCredits,
      timestamp: new Date()
    });
    
    logger.info(`User ${userId} unlocked episode with credits: ${seriesId}/${episodeNum}`);
    
    res.json({
      success: true,
      unlock,
      creditsRemaining: response.data.creditsRemaining,
      message: `Episode unlocked for ${costCredits} credits`
    });
    
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return res.status(400).json({
        error: 'Insufficient Credits',
        message: 'Not enough credits to unlock this episode'
      });
    }
    throw error;
  }
}

/**
 * Handle premium subscription unlock
 */
async function handlePremiumUnlock(req, res, userId, seriesId, episodeNum, episode) {
  // Call Auth Service to check premium status
  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  
  try {
    const response = await axios.get(
      `${authServiceUrl}/api/auth/premium/status`,
      { headers: { Authorization: req.headers.authorization } }
    );
    
    if (!response.data.isPremium) {
      return res.status(403).json({
        error: 'Premium Required',
        message: 'Premium subscription required to unlock this episode'
      });
    }
    
    const unlock = await Unlock.create({
      userId,
      seriesId,
      episodeNum,
      method: 'premium',
      timestamp: new Date()
    });
    
    logger.info(`Premium user ${userId} unlocked episode: ${seriesId}/${episodeNum}`);
    
    res.json({
      success: true,
      unlock,
      message: 'Episode unlocked via premium subscription'
    });
    
  } catch (error) {
    throw error;
  }
}

/**
 * Handle IAP unlock (single episode purchase)
 */
async function handleIAPUnlock(req, res, userId, seriesId, episodeNum, transactionId) {
  if (!transactionId) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Transaction ID is required for IAP unlock'
    });
  }
  
  // Call Payment Service to verify transaction
  // For now, accept any transaction ID
  
  const unlock = await Unlock.create({
    userId,
    seriesId,
    episodeNum,
    method: 'iap',
    transactionId,
    timestamp: new Date()
  });
  
  logger.info(`User ${userId} unlocked episode via IAP: ${seriesId}/${episodeNum}`);
  
  res.json({
    success: true,
    unlock,
    message: 'Episode unlocked via in-app purchase'
  });
}

/**
 * GET /api/unlock/user
 * Get all unlocks for current user
 */
exports.getUserUnlocks = async (req, res) => {
  try {
    const userId = req.userId;
    const { seriesId } = req.query;
    
    const filter = { userId };
    if (seriesId) {
      filter.seriesId = seriesId;
    }
    
    const unlocks = await Unlock.find(filter)
      .sort({ timestamp: -1 })
      .populate('seriesId', 'title slug thumbnailUrl');
    
    const validUnlocks = unlocks.filter(unlock => unlock.isValid());
    
    res.json({
      unlocks: validUnlocks,
      total: validUnlocks.length
    });
    
  } catch (error) {
    logger.error('Get user unlocks error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch unlocks'
    });
  }
};

/**
 * GET /api/unlock/check
 * Check if user has unlocked a specific episode
 */
exports.checkUnlock = async (req, res) => {
  try {
    const userId = req.userId;
    const { seriesId, episodeNum } = req.query;
    
    if (!seriesId || !episodeNum) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'seriesId and episodeNum are required'
      });
    }
    
    const hasUnlocked = await Unlock.hasUnlocked(userId, seriesId, parseInt(episodeNum));
    
    res.json({
      seriesId,
      episodeNum: parseInt(episodeNum),
      isUnlocked: hasUnlocked
    });
    
  } catch (error) {
    logger.error('Check unlock error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to check unlock status'
    });
  }
};

module.exports = exports;
