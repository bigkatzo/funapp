/**
 * Auth Controller
 * Handles authentication logic: signup, login, token refresh
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generate JWT access and refresh tokens
 */
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
  
  return { accessToken, refreshToken };
}

/**
 * POST /api/auth/signup
 * Create new user account
 */
exports.signup = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required'
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 8 characters'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists'
      });
    }
    
    // Create user
    const user = new User({
      email: email.toLowerCase(),
      passwordHash: password, // Will be hashed by pre-save hook
      displayName: displayName || email.split('@')[0],
      credits: 50 // Welcome bonus
    });
    
    await user.save();
    
    // Generate tokens
    const tokens = generateTokens(user._id);
    
    // Store refresh token in Redis (for invalidation)
    const redis = req.app.get('redis');
    await redis.setEx(
      `refresh_token:${user._id}`,
      30 * 24 * 60 * 60, // 30 days
      tokens.refreshToken
    );
    
    logger.info(`New user signed up: ${user.email}`);
    
    res.status(201).json({
      message: 'Account created successfully',
      user: user.toJSON(),
      tokens
    });
    
  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create account'
    });
  }
};

/**
 * POST /api/auth/login
 * Login with email and password
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required'
      });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account Disabled',
        message: 'Your account has been disabled. Contact support.'
      });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate tokens
    const tokens = generateTokens(user._id);
    
    // Store refresh token in Redis
    const redis = req.app.get('redis');
    await redis.setEx(
      `refresh_token:${user._id}`,
      30 * 24 * 60 * 60,
      tokens.refreshToken
    );
    
    // Store session in Redis
    await redis.setEx(
      `session:${user._id}`,
      60 * 60, // 1 hour
      JSON.stringify({
        userId: user._id,
        email: user.email,
        lastAccess: new Date().toISOString()
      })
    );
    
    logger.info(`User logged in: ${user.email}`);
    
    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      tokens
    });
    
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Login failed'
    });
  }
};

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Refresh token is invalid or expired'
      });
    }
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Not a refresh token'
      });
    }
    
    // Check if refresh token exists in Redis
    const redis = req.app.get('redis');
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    
    if (storedToken !== refreshToken) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Refresh token has been revoked'
      });
    }
    
    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'User not found or account disabled'
      });
    }
    
    // Generate new access token (keep same refresh token)
    const accessToken = jwt.sign(
      { userId: user._id, type: 'access' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      message: 'Token refreshed successfully',
      accessToken
    });
    
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Token refresh failed'
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout and invalidate tokens
 */
exports.logout = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Delete tokens from Redis
    const redis = req.app.get('redis');
    await redis.del(`refresh_token:${userId}`);
    await redis.del(`session:${userId}`);
    
    logger.info(`User logged out: ${req.user.email}`);
    
    res.json({
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Logout failed'
    });
  }
};

/**
 * GET /api/auth/profile
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    // req.user is set by auth middleware
    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * PUT /api/auth/profile
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { displayName, avatarUrl } = req.body;
    const user = req.user;
    
    // Update fields
    if (displayName !== undefined) {
      user.displayName = displayName;
    }
    if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl;
    }
    
    await user.save();
    
    logger.info(`User updated profile: ${user.email}`);
    
    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
    
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update profile'
    });
  }
};

/**
 * POST /api/auth/change-password
 * Change user password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Current and new passwords are required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'New password must be at least 8 characters'
      });
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.passwordHash = newPassword; // Will be hashed by pre-save hook
    await user.save();
    
    // Invalidate all existing sessions
    const redis = req.app.get('redis');
    await redis.del(`refresh_token:${user._id}`);
    await redis.del(`session:${user._id}`);
    
    logger.info(`User changed password: ${user.email}`);
    
    res.json({
      message: 'Password changed successfully. Please login again.'
    });
    
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to change password'
    });
  }
};

/**
 * DELETE /api/auth/account
 * Delete user account (GDPR compliance)
 */
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = req.user;
    
    // Verify password for security
    if (user.passwordHash) {
      if (!password) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Password confirmation required'
        });
      }
      
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Authentication Failed',
          message: 'Password is incorrect'
        });
      }
    }
    
    // Soft delete (mark as inactive)
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();
    
    // Delete sessions
    const redis = req.app.get('redis');
    await redis.del(`refresh_token:${user._id}`);
    await redis.del(`session:${user._id}`);
    
    logger.info(`User account deleted: ${user._id}`);
    
    res.json({
      message: 'Account deleted successfully'
    });
    
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete account'
    });
  }
};
