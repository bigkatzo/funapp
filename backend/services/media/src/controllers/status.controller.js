/**
 * Status Controller
 * Check video processing status
 */

const Video = require('../models/video.model');
const logger = require('../utils/logger');

/**
 * GET /api/status/:uploadId
 * Get video processing status
 */
exports.getStatus = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const userId = req.userId;
    
    const video = await Video.findOne({ uploadId, userId });
    
    if (!video) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Video not found'
      });
    }
    
    // Get job progress if processing
    let jobProgress = null;
    if (video.status === 'processing' && video.jobId) {
      const transcodingQueue = req.app.get('transcodingQueue');
      const job = await transcodingQueue.getJob(video.jobId);
      
      if (job) {
        jobProgress = await job.progress();
      }
    }
    
    res.json({
      uploadId: video.uploadId,
      status: video.status,
      progress: jobProgress,
      duration: video.duration,
      thumbnailUrl: video.thumbnailUrl,
      masterPlaylistUrl: video.masterPlaylistUrl,
      outputs: video.outputs,
      errorMessage: video.errorMessage,
      createdAt: video.createdAt,
      processingStarted: video.processingStarted,
      processingCompleted: video.processingCompleted
    });
    
  } catch (error) {
    logger.error('Get status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch status'
    });
  }
};

/**
 * GET /api/status/user/uploads
 * Get all user's uploads
 */
exports.getUserUploads = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = { userId };
    if (status) filter.status = status;
    
    const [videos, total] = await Promise.all([
      Video.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      Video.countDocuments(filter)
    ]);
    
    res.json({
      videos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    logger.error('Get user uploads error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch uploads'
    });
  }
};

/**
 * GET /api/status/queue/stats
 * Get queue statistics (admin)
 */
exports.getQueueStats = async (req, res) => {
  try {
    const transcodingQueue = req.app.get('transcodingQueue');
    
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      transcodingQueue.getWaitingCount(),
      transcodingQueue.getActiveCount(),
      transcodingQueue.getCompletedCount(),
      transcodingQueue.getFailedCount(),
      transcodingQueue.getDelayedCount()
    ]);
    
    res.json({
      queue: 'video-transcoding',
      stats: {
        waiting,
        active,
        completed,
        failed,
        delayed,
        total: waiting + active + completed + failed + delayed
      }
    });
    
  } catch (error) {
    logger.error('Get queue stats error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch queue stats'
    });
  }
};

module.exports = exports;
