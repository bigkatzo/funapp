/**
 * Upload Controller
 * Handles video upload initialization and completion
 */

const { S3Client, PutObjectCommand, CreateMultipartUploadCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const Video = require('../models/video.model');
const logger = require('../utils/logger');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'fun-app-media-dev';

/**
 * POST /api/upload/init
 * Initialize video upload
 */
exports.initUpload = async (req, res) => {
  try {
    const { filename, fileSize, seriesId, episodeNum } = req.body;
    const userId = req.userId;
    
    if (!filename || !fileSize) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Filename and file size are required'
      });
    }
    
    // Validate file size (max 5GB)
    const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
    if (fileSize > maxSize) {
      return res.status(400).json({
        error: 'File Too Large',
        message: 'Maximum file size is 5GB'
      });
    }
    
    // Validate file extension
    const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({
        error: 'Invalid File Type',
        message: `Allowed formats: ${allowedExtensions.join(', ')}`
      });
    }
    
    // Generate upload ID
    const uploadId = uuidv4();
    const s3Key = `uploads/raw/${uploadId}/${filename}`;
    
    // Create video record
    const video = await Video.create({
      uploadId,
      userId,
      seriesId: seriesId || null,
      episodeNum: episodeNum || null,
      originalFilename: filename,
      originalSize: fileSize,
      originalUrl: `s3://${BUCKET_NAME}/${s3Key}`,
      status: 'uploading'
    });
    
    // Generate presigned URL for upload (valid for 1 hour)
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: 'video/*'
    });
    
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    logger.info(`Upload initialized: ${uploadId} for user ${userId}`);
    
    res.json({
      uploadId,
      presignedUrl,
      s3Key,
      expiresIn: 3600,
      message: 'Upload initialized. Use presigned URL to upload file.'
    });
    
  } catch (error) {
    logger.error('Init upload error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to initialize upload'
    });
  }
};

/**
 * POST /api/upload/complete
 * Mark upload as complete and trigger transcoding
 */
exports.completeUpload = async (req, res) => {
  try {
    const { uploadId } = req.body;
    const userId = req.userId;
    
    if (!uploadId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Upload ID is required'
      });
    }
    
    // Find video record
    const video = await Video.findOne({ uploadId, userId });
    
    if (!video) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Upload not found'
      });
    }
    
    if (video.status !== 'uploading') {
      return res.status(400).json({
        error: 'Invalid Status',
        message: `Upload is already in ${video.status} status`
      });
    }
    
    // Add transcoding job to queue
    const transcodingQueue = req.app.get('transcodingQueue');
    
    const job = await transcodingQueue.add({
      videoId: video._id.toString(),
      uploadId: video.uploadId,
      originalUrl: video.originalUrl,
      filename: video.originalFilename
    }, {
      priority: 1,
      attempts: 3
    });
    
    // Update video status
    video.jobId = job.id.toString();
    await video.updateStatus('processing');
    
    logger.info(`Transcoding job created: ${job.id} for upload ${uploadId}`);
    
    res.json({
      uploadId,
      jobId: job.id.toString(),
      status: 'processing',
      message: 'Upload complete. Transcoding started.'
    });
    
  } catch (error) {
    logger.error('Complete upload error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to complete upload'
    });
  }
};

/**
 * POST /api/upload/multipart/init
 * Initialize multipart upload (for large files)
 */
exports.initMultipartUpload = async (req, res) => {
  try {
    const { filename, seriesId, episodeNum } = req.body;
    const userId = req.userId;
    
    if (!filename) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Filename is required'
      });
    }
    
    // Generate upload ID
    const uploadId = uuidv4();
    const s3Key = `uploads/raw/${uploadId}/${filename}`;
    
    // Create multipart upload
    const command = new CreateMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: 'video/*'
    });
    
    const multipartUpload = await s3Client.send(command);
    
    // Create video record
    const video = await Video.create({
      uploadId,
      userId,
      seriesId: seriesId || null,
      episodeNum: episodeNum || null,
      originalFilename: filename,
      originalUrl: `s3://${BUCKET_NAME}/${s3Key}`,
      status: 'uploading'
    });
    
    logger.info(`Multipart upload initialized: ${uploadId}`);
    
    res.json({
      uploadId,
      s3UploadId: multipartUpload.UploadId,
      s3Key,
      message: 'Multipart upload initialized'
    });
    
  } catch (error) {
    logger.error('Init multipart upload error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to initialize multipart upload'
    });
  }
};

/**
 * DELETE /api/upload/:uploadId
 * Cancel upload
 */
exports.cancelUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const userId = req.userId;
    
    const video = await Video.findOne({ uploadId, userId });
    
    if (!video) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Upload not found'
      });
    }
    
    if (video.status === 'completed') {
      return res.status(400).json({
        error: 'Cannot Cancel',
        message: 'Upload is already completed'
      });
    }
    
    // If processing, cancel the job
    if (video.status === 'processing' && video.jobId) {
      const transcodingQueue = req.app.get('transcodingQueue');
      const job = await transcodingQueue.getJob(video.jobId);
      if (job) {
        await job.remove();
      }
    }
    
    // Update status
    await video.updateStatus('failed', 'Cancelled by user');
    
    logger.info(`Upload cancelled: ${uploadId}`);
    
    res.json({
      message: 'Upload cancelled successfully'
    });
    
  } catch (error) {
    logger.error('Cancel upload error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to cancel upload'
    });
  }
};

module.exports = exports;
