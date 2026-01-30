/**
 * Video Model
 * Tracks video upload and processing status
 */

const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  uploadId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  seriesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',
    index: true
  },
  episodeNum: Number,
  
  // Original upload
  originalFilename: String,
  originalSize: Number, // bytes
  originalUrl: String, // S3 URL
  
  // Processing status
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'failed'],
    default: 'uploading',
    index: true
  },
  
  // Video metadata
  duration: Number, // seconds
  width: Number,
  height: Number,
  aspectRatio: String, // e.g., "9:16"
  
  // HLS outputs
  outputs: [{
    quality: String, // "360p", "540p", "720p", "1080p"
    resolution: String, // e.g., "720x1280"
    bitrate: Number, // kbps
    url: String, // .m3u8 playlist URL
    size: Number // bytes
  }],
  
  masterPlaylistUrl: String, // Master .m3u8
  thumbnailUrl: String,
  spriteSheetUrl: String, // For seeking preview
  
  // Processing details
  jobId: String, // Bull queue job ID
  processingStarted: Date,
  processingCompleted: Date,
  errorMessage: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
videoSchema.index({ uploadId: 1 });
videoSchema.index({ userId: 1, status: 1 });
videoSchema.index({ seriesId: 1, episodeNum: 1 });
videoSchema.index({ status: 1, createdAt: -1 });

// Method to update status
videoSchema.methods.updateStatus = function(status, errorMessage = null) {
  this.status = status;
  if (errorMessage) {
    this.errorMessage = errorMessage;
  }
  if (status === 'processing') {
    this.processingStarted = new Date();
  }
  if (status === 'completed' || status === 'failed') {
    this.processingCompleted = new Date();
  }
  return this.save();
};

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
