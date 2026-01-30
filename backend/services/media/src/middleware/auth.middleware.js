/**
 * Auth Middleware (Proxy)
 * Forwards auth validation to Auth Service
 */

const axios = require('axios');
const logger = require('../utils/logger');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

/**
 * Authenticate user via Auth Service
 */
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token is missing or invalid'
      });
    }
    
    // Validate token with Auth Service
    try {
      const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/profile`, {
        headers: { Authorization: authHeader }
      });
      
      req.user = response.data.user;
      req.userId = response.data.user._id;
      next();
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        });
      }
      throw error;
    }
    
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};
