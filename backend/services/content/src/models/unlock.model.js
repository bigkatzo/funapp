/**
 * Unlock Model
 * Tracks which episodes users have unlocked
 */

const mongoose = require('mongoose');

const unlockSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  seriesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',
    required: true,
    index: true
  },
  episodeNum: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['free', 'ad', 'credits', 'iap', 'premium', 'token'],
    required: true
  },
  creditsSpent: {
    type: Number,
    min: 0,
    default: 0
  },
  transactionId: {
    type: String
  },
  tokenTxHash: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for fast unlock checks
unlockSchema.index({ userId: 1, seriesId: 1, episodeNum: 1 }, { unique: true });
unlockSchema.index({ timestamp: -1 });

// Check if unlock is still valid
unlockSchema.methods.isValid = function() {
  if (!this.expiresAt) return true;
  return this.expiresAt > new Date();
};

// Static method to check if user has unlocked episode
unlockSchema.statics.hasUnlocked = async function(userId, seriesId, episodeNum) {
  const unlock = await this.findOne({ userId, seriesId, episodeNum });
  if (!unlock) return false;
  return unlock.isValid();
};

// Static method to get all unlocked episodes for a series
unlockSchema.statics.getUnlockedEpisodes = async function(userId, seriesId) {
  const unlocks = await this.find({ userId, seriesId });
  return unlocks
    .filter(unlock => unlock.isValid())
    .map(unlock => unlock.episodeNum);
};

const Unlock = mongoose.model('Unlock', unlockSchema);

module.exports = Unlock;
