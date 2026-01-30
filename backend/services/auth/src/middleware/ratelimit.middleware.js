/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP
 */

const logger = require('../utils/logger');

/**
 * Rate limiter using Redis
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowSeconds - Time window in seconds
 */
exports.rateLimiter = (maxRequests, windowSeconds) => {
  return async (req, res, next) => {
    try {
      const redis = req.app.get('redis');
      const ip = req.ip || req.connection.remoteAddress;
      const key = `ratelimit:${req.path}:${ip}`;
      
      // Get current count
      const current = await redis.get(key);
      
      if (current && parseInt(current) >= maxRequests) {
        logger.warn(`Rate limit exceeded for IP ${ip} on ${req.path}`);
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Please try again in ${windowSeconds} seconds.`
        });
      }
      
      // Increment counter
      await redis.multi()
        .incr(key)
        .expire(key, windowSeconds)
        .exec();
      
      next();
      
    } catch (error) {
      logger.error('Rate limiter error:', error);
      // Don't block on rate limiter errors
      next();
    }
  };
};
