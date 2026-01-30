/**
 * User Model
 * MongoDB schema for user accounts
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: function() {
      // Password required unless OAuth user
      return !this.oauthProvider;
    }
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  avatarUrl: {
    type: String,
    default: null
  },
  
  // OAuth
  oauthProvider: {
    type: String,
    enum: ['google', 'facebook', 'apple', null],
    default: null
  },
  oauthId: {
    type: String,
    sparse: true
  },
  
  // Credits & Premium
  credits: {
    type: Number,
    default: 0,
    min: 0
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumTier: {
    type: String,
    enum: ['monthly', 'annual', null],
    default: null
  },
  premiumExpiresAt: {
    type: Date,
    default: null
  },
  
  // Future Web3
  walletAddress: {
    type: String,
    default: null,
    sparse: true
  },
  tokenBalance: {
    type: Number,
    default: 0
  },
  
  // User Data
  watchHistory: [{
    seriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Series'
    },
    episodeNum: Number,
    progress: Number, // seconds
    lastWatched: {
      type: Date,
      default: Date.now
    }
  }],
  
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series'
  }],
  
  // Account Status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  
  // Metadata
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
userSchema.index({ email: 1 });
userSchema.index({ walletAddress: 1 });
userSchema.index({ oauthProvider: 1, oauthId: 1 });
userSchema.index({ createdAt: 1 });

// Virtual for checking premium status
userSchema.virtual('isPremiumActive').get(function() {
  if (!this.isPremium) return false;
  if (!this.premiumExpiresAt) return true; // Lifetime premium
  return this.premiumExpiresAt > new Date();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to add credits
userSchema.methods.addCredits = function(amount) {
  this.credits += amount;
  return this.save();
};

// Method to spend credits
userSchema.methods.spendCredits = function(amount) {
  if (this.credits < amount) {
    throw new Error('Insufficient credits');
  }
  this.credits -= amount;
  return this.save();
};

// Method to add to watch history
userSchema.methods.updateWatchHistory = function(seriesId, episodeNum, progress) {
  const existingIndex = this.watchHistory.findIndex(
    item => item.seriesId.toString() === seriesId.toString() && item.episodeNum === episodeNum
  );
  
  if (existingIndex >= 0) {
    this.watchHistory[existingIndex].progress = progress;
    this.watchHistory[existingIndex].lastWatched = new Date();
  } else {
    this.watchHistory.push({
      seriesId,
      episodeNum,
      progress,
      lastWatched: new Date()
    });
  }
  
  // Keep only last 100 items
  if (this.watchHistory.length > 100) {
    this.watchHistory = this.watchHistory.slice(-100);
  }
  
  return this.save();
};

// Method to toggle favorite
userSchema.methods.toggleFavorite = function(seriesId) {
  const index = this.favorites.indexOf(seriesId);
  if (index >= 0) {
    this.favorites.splice(index, 1);
  } else {
    this.favorites.push(seriesId);
  }
  return this.save();
};

// Remove sensitive data from JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
