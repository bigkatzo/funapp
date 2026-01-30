/**
 * Series Model
 * MongoDB schema for video series and episodes
 */

const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  episodeNum: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number, // seconds
    required: true
  },
  isFree: {
    type: Boolean,
    default: false
  },
  unlockCostCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  unlockCostUSD: {
    type: Number,
    default: 0,
    min: 0
  },
  premiumOnly: {
    type: Boolean,
    default: false
  },
  unlockCostTokens: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [{
    productId: mongoose.Schema.Types.ObjectId,
    timestamp: Number, // seconds into video
    productName: String,
    productImageUrl: String,
    priceUSD: Number
  }]
}, { _id: false });

const seriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  genres: [{
    type: String,
    enum: ['Drama', 'Romance', 'Thriller', 'Comedy', 'Horror', 'Fantasy', 'Action', 'Sci-Fi', 'Mystery']
  }],
  thumbnailUrl: {
    type: String,
    required: true
  },
  trailerUrl: {
    type: String
  },
  episodes: [episodeSchema],
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    favorites: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
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
seriesSchema.index({ title: 'text', description: 'text' });
seriesSchema.index({ slug: 1 });
seriesSchema.index({ genres: 1 });
seriesSchema.index({ 'stats.views': -1 });
seriesSchema.index({ createdAt: -1 });
seriesSchema.index({ isActive: 1 });

// Virtual for episode count
seriesSchema.virtual('episodeCount').get(function() {
  return this.episodes.length;
});

// Virtual for free episode count
seriesSchema.virtual('freeEpisodeCount').get(function() {
  return this.episodes.filter(ep => ep.isFree).length;
});

// Method to increment views
seriesSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

// Method to increment likes
seriesSchema.methods.incrementLikes = function() {
  this.stats.likes += 1;
  return this.save();
};

// Method to decrement likes
seriesSchema.methods.decrementLikes = function() {
  this.stats.likes = Math.max(0, this.stats.likes - 1);
  return this.save();
};

// Method to get episode by number
seriesSchema.methods.getEpisode = function(episodeNum) {
  return this.episodes.find(ep => ep.episodeNum === episodeNum);
};

const Series = mongoose.model('Series', seriesSchema);

module.exports = Series;
