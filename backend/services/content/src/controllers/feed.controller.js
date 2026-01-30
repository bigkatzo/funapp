/**
 * Feed Controller
 * Generates personalized content feeds
 */

const Series = require('../models/series.model');
const logger = require('../utils/logger');

/**
 * GET /api/feed
 * Get personalized feed for user
 */
exports.getFeed = async (req, res) => {
  try {
    const userId = req.userId; // Optional, from optional auth middleware
    const redis = req.app.get('redis');
    
    // Try to get from cache
    const cacheKey = userId ? `feed:user:${userId}` : 'feed:default';
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    // Build feed sections
    const feed = {
      spotlight: await getSpotlightSeries(),
      trending: await getTrendingSeries(10),
      forYou: userId ? await getRecommendedSeries(userId, 20) : await getPopularSeries(20),
      genres: await getGenreSections()
    };
    
    // Cache for 5 minutes
    await redis.setEx(cacheKey, 300, JSON.stringify(feed));
    
    res.json(feed);
    
  } catch (error) {
    logger.error('Get feed error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate feed'
    });
  }
};

/**
 * Get spotlight series (featured content)
 */
async function getSpotlightSeries() {
  return await Series.find({ isActive: true })
    .sort({ 'stats.views': -1 })
    .limit(5)
    .select('title slug description thumbnailUrl trailerUrl genres stats');
}

/**
 * Get trending series
 */
async function getTrendingSeries(limit = 10) {
  return await Series.find({ isActive: true })
    .sort({ 'stats.views': -1, createdAt: -1 })
    .limit(limit)
    .select('title slug thumbnailUrl genres stats');
}

/**
 * Get popular series (fallback for non-authenticated)
 */
async function getPopularSeries(limit = 20) {
  return await Series.find({ isActive: true })
    .sort({ 'stats.likes': -1, 'stats.views': -1 })
    .limit(limit)
    .select('title slug thumbnailUrl genres stats');
}

/**
 * Get recommended series (personalized)
 * TODO: Implement ML-based recommendations in future
 */
async function getRecommendedSeries(userId, limit = 20) {
  // For now, return popular series
  // In production, use collaborative filtering based on watch history
  return await getPopularSeries(limit);
}

/**
 * Get series grouped by genre
 */
async function getGenreSections() {
  const genres = ['Drama', 'Romance', 'Thriller', 'Comedy', 'Horror'];
  const sections = {};
  
  for (const genre of genres) {
    sections[genre.toLowerCase()] = await Series.find({ 
      isActive: true,
      genres: genre
    })
      .sort({ 'stats.views': -1 })
      .limit(10)
      .select('title slug thumbnailUrl genres stats');
  }
  
  return sections;
}

module.exports = exports;
