/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production';

/**
 * Authenticate user via JWT token
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token is missing or invalid'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer '
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token Expired',
          message: 'Access token has expired. Please refresh.'
        });
      }
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Access token is invalid'
      });
    }
    
    // Check token type
    if (decoded.type !== 'access') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Not an access token'
      });
    }
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account Disabled',
        message: 'Your account has been disabled'
      });
    }
    
    // Attach user to request
    req.user = user;
    req.userId = user._id.toString();
    
    next();
    
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Optional authentication (doesn't fail if no token)
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without user
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.type === 'access') {
        const user = await User.findById(decoded.userId);
        if (user && user.isActive) {
          req.user = user;
          req.userId = user._id.toString();
        }
      }
    } catch (err) {
      // Invalid token, continue without user
    }
    
    next();
    
  } catch (error) {
    logger.error('Optional auth error:', error);
    next(); // Don't fail, continue without user
  }
};
