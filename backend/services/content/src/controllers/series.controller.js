/**
 * Series Controller
 * Handles series and episode management
 */

const Series = require('../models/series.model');
const Unlock = require('../models/unlock.model');
const logger = require('../utils/logger');

/**
 * GET /api/series
 * List all series with pagination and filtering
 */
exports.listSeries = async (req, res) => {
  try {
    const { page = 1, limit = 20, genre, sort = 'views' } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = { isActive: true };
    if (genre) {
      filter.genres = genre;
    }
    
    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'views':
        sortOption = { 'stats.views': -1 };
        break;
      case 'likes':
        sortOption = { 'stats.likes': -1 };
        break;
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { 'stats.views': -1 };
    }
    
    const [series, total] = await Promise.all([
      Series.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-episodes.tags -episodes.videoUrl'), // Don't send full episode data in list
      Series.countDocuments(filter)
    ]);
    
    res.json({
      series,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    logger.error('List series error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch series'
    });
  }
};

/**
 * GET /api/series/:id
 * Get series details with all episodes
 */
exports.getSeries = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // From optional auth middleware
    
    const series = await Series.findById(id);
    
    if (!series) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Series not found'
      });
    }
    
    if (!series.isActive) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Series is not available'
      });
    }
    
    // Get unlocked episodes if user is authenticated
    let unlockedEpisodes = [];
    if (userId) {
      unlockedEpisodes = await Unlock.getUnlockedEpisodes(userId, id);
    }
    
    // Add unlock status to episodes
    const seriesData = series.toObject();
    seriesData.episodes = seriesData.episodes.map(episode => ({
      ...episode,
      isUnlocked: episode.isFree || unlockedEpisodes.includes(episode.episodeNum),
      videoUrl: episode.isFree || unlockedEpisodes.includes(episode.episodeNum) 
        ? episode.videoUrl 
        : null // Hide video URL for locked episodes
    }));
    
    res.json(seriesData);
    
  } catch (error) {
    logger.error('Get series error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch series'
    });
  }
};

/**
 * GET /api/series/:id/episodes/:episodeNum
 * Get specific episode details
 */
exports.getEpisode = async (req, res) => {
  try {
    const { id, episodeNum } = req.params;
    const userId = req.userId;
    
    const series = await Series.findById(id);
    
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
    
    // Check if unlocked
    let isUnlocked = episode.isFree;
    if (!isUnlocked && userId) {
      isUnlocked = await Unlock.hasUnlocked(userId, id, parseInt(episodeNum));
    }
    
    const episodeData = episode.toObject();
    episodeData.isUnlocked = isUnlocked;
    
    // Hide video URL if locked
    if (!isUnlocked) {
      episodeData.videoUrl = null;
    }
    
    res.json({
      series: {
        _id: series._id,
        title: series.title,
        slug: series.slug,
        thumbnailUrl: series.thumbnailUrl
      },
      episode: episodeData
    });
    
  } catch (error) {
    logger.error('Get episode error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch episode'
    });
  }
};

/**
 * POST /api/series/:id/view
 * Track episode view
 */
exports.trackView = async (req, res) => {
  try {
    const { id } = req.params;
    const { episodeNum, progress } = req.body;
    const userId = req.userId;
    
    const series = await Series.findById(id);
    
    if (!series) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Series not found'
      });
    }
    
    // Increment view count
    await series.incrementViews();
    
    // Update user watch history (would call User service or update directly)
    // For now, just acknowledge
    
    res.json({
      message: 'View tracked successfully'
    });
    
  } catch (error) {
    logger.error('Track view error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to track view'
    });
  }
};

/**
 * GET /api/series/search
 * Search series by title/description
 */
exports.searchSeries = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Search query is required'
      });
    }
    
    const [series, total] = await Promise.all([
      Series.find(
        { 
          $text: { $search: q },
          isActive: true
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-episodes.tags -episodes.videoUrl'),
      Series.countDocuments({ 
        $text: { $search: q },
        isActive: true
      })
    ]);
    
    res.json({
      query: q,
      series,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    logger.error('Search series error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Search failed'
    });
  }
};
