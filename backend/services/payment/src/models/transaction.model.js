/**
 * Transaction Model
 * Records all payment transactions
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'credit_purchase',    // User bought credits
      'credit_spend',       // User spent credits
      'subscription',       // Subscription payment
      'refund',            // Refund issued
      'bonus'              // Welcome bonus, referral, etc.
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['credits', 'USD'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'apple_iap', 'google_play', 'token', 'system'],
    required: true
  },
  transactionId: {
    type: String,
    index: true
  },
  metadata: {
    seriesId: mongoose.Schema.Types.ObjectId,
    episodeNum: Number,
    productSku: String,
    subscriptionTier: String,
    description: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  errorMessage: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ status: 1 });

// Static method to create credit purchase transaction
transactionSchema.statics.createCreditPurchase = async function(userId, amount, paymentMethod, transactionId, productSku) {
  return this.create({
    userId,
    type: 'credit_purchase',
    amount,
    currency: 'credits',
    paymentMethod,
    transactionId,
    metadata: { productSku },
    status: 'completed'
  });
};

// Static method to create credit spend transaction
transactionSchema.statics.createCreditSpend = async function(userId, amount, seriesId, episodeNum) {
  return this.create({
    userId,
    type: 'credit_spend',
    amount,
    currency: 'credits',
    paymentMethod: 'system',
    metadata: { seriesId, episodeNum },
    status: 'completed'
  });
};

// Static method to create subscription transaction
transactionSchema.statics.createSubscription = async function(userId, amountUSD, paymentMethod, transactionId, tier) {
  return this.create({
    userId,
    type: 'subscription',
    amount: amountUSD,
    currency: 'USD',
    paymentMethod,
    transactionId,
    metadata: { subscriptionTier: tier },
    status: 'completed'
  });
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
