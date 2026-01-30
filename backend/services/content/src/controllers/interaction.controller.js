/**
 * Interaction Controller
 * Handles likes, comments, favorites
 */

const Series = require('../models/series.model');
const Comment = require('../models/comment.model');
const logger = require('../utils/logger');

/**
 * POST /api/series/:id/like
 * Toggle like on series
 */
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const redis = req.app.get('redis');
    const io = req.app.get('io');
    
    const series = await Series.findById(id);
    
    if (!series) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Series not found'
      });
    }
    
    // Check if user has already liked
    const likeKey = `like:${userId}:${id}`;
    const hasLiked = await redis.get(likeKey);
    
    if (hasLiked) {
      // Unlike
      await series.decrementLikes();
      await redis.del(likeKey);
      
      // Broadcast update
      io.to(`series:${id}`).emit('like-updated', {
        seriesId: id,
        likes: series.stats.likes,
        action: 'unlike'
      });
      
      res.json({
        liked: false,
        likes: series.stats.likes
      });
    } else {
      // Like
      await series.incrementLikes();
      await redis.set(likeKey, '1'); // Store indefinitely
      
      // Broadcast update
      io.to(`series:${id}`).emit('like-updated', {
        seriesId: id,
        likes: series.stats.likes,
        action: 'like'
      });
      
      res.json({
        liked: true,
        likes: series.stats.likes
      });
    }
    
  } catch (error) {
    logger.error('Toggle like error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to toggle like'
    });
  }
};

/**
 * POST /api/series/:id/favorite
 * Toggle favorite on series
 */
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const redis = req.app.get('redis');
    
    const series = await Series.findById(id);
    
    if (!series) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Series not found'
      });
    }
    
    // Check if user has favorited
    const favKey = `favorite:${userId}:${id}`;
    const hasFavorited = await redis.get(favKey);
    
    if (hasFavorited) {
      // Remove favorite
      series.stats.favorites = Math.max(0, series.stats.favorites - 1);
      await series.save();
      await redis.del(favKey);
      
      res.json({
        favorited: false,
        favorites: series.stats.favorites
      });
    } else {
      // Add favorite
      series.stats.favorites += 1;
      await series.save();
      await redis.set(favKey, '1');
      
      res.json({
        favorited: true,
        favorites: series.stats.favorites
      });
    }
    
  } catch (error) {
    logger.error('Toggle favorite error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to toggle favorite'
    });
  }
};

/**
 * GET /api/favorites
 * Get user's favorite series
 */
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.userId;
    const redis = req.app.get('redis');
    
    // Get all favorite keys for user
    const keys = await redis.keys(`favorite:${userId}:*`);
    const seriesIds = keys.map(key => key.split(':')[2]);
    
    if (seriesIds.length === 0) {
      return res.json({ series: [], total: 0 });
    }
    
    const series = await Series.find({
      _id: { $in: seriesIds },
      isActive: true
    }).select('title slug thumbnailUrl genres stats');
    
    res.json({
      series,
      total: series.length
    });
    
  } catch (error) {
    logger.error('Get favorites error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch favorites'
    });
  }
};

/**
 * POST /api/comments
 * Add comment to series
 */
exports.addComment = async (req, res) => {
  try {
    const { seriesId, text } = req.body;
    const userId = req.userId;
    const io = req.app.get('io');
    
    if (!seriesId || !text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Series ID and comment text are required'
      });
    }
    
    if (text.length > 500) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Comment must be 500 characters or less'
      });
    }
    
    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Series not found'
      });
    }
    
    const comment = await Comment.create({
      seriesId,
      userId,
      text: text.trim()
    });
    
    // Broadcast new comment
    io.to(`series:${seriesId}`).emit('new-comment', {
      comment: comment.toObject(),
      userId
    });
    
    logger.info(`User ${userId} commented on series ${seriesId}`);
    
    res.status(201).json({
      comment,
      message: 'Comment added successfully'
    });
    
  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add comment'
    });
  }
};

/**
 * GET /api/comments/:seriesId
 * Get comments for series
 */
exports.getComments = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    const [comments, total] = await Promise.all([
      Comment.find({ seriesId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'displayName avatarUrl'),
      Comment.countDocuments({ seriesId, isDeleted: false })
    ]);
    
    res.json({
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    logger.error('Get comments error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch comments'
    });
  }
};

/**
 * DELETE /api/comments/:id
 * Delete comment (soft delete)
 */
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Comment not found'
      });
    }
    
    // Check if user owns the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own comments'
      });
    }
    
    comment.isDeleted = true;
    await comment.save();
    
    res.json({
      message: 'Comment deleted successfully'
    });
    
  } catch (error) {
    logger.error('Delete comment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete comment'
    });
  }
};

module.exports = exports;
