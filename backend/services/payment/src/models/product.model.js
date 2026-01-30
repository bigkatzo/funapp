/**
 * Product Model
 * Defines purchasable items (credit packages, subscriptions)
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['credits', 'subscription', 'episode', 'merchandise'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  credits: {
    type: Number,
    default: 0
  },
  priceUSD: {
    type: Number,
    required: true,
    min: 0
  },
  stripePriceId: String,
  appleProductId: String,
  googleProductId: String,
  metadata: {
    subscriptionDuration: Number, // days
    bonusPercentage: Number,
    features: [String]
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
productSchema.index({ type: 1, isActive: 1 });
productSchema.index({ sku: 1 });

// Predefined products
productSchema.statics.getDefaultProducts = function() {
  return [
    {
      sku: 'credits_100',
      type: 'credits',
      name: '100 Credits',
      description: 'Perfect for trying out premium content',
      credits: 100,
      priceUSD: 0.99,
      appleProductId: 'com.fun.app.credits.100',
      googleProductId: 'credits_100'
    },
    {
      sku: 'credits_500',
      type: 'credits',
      name: '500 Credits',
      description: 'Best value for regular viewers',
      credits: 500,
      priceUSD: 4.99,
      appleProductId: 'com.fun.app.credits.500',
      googleProductId: 'credits_500'
    },
    {
      sku: 'credits_1000',
      type: 'credits',
      name: '1000 Credits',
      description: '10% bonus credits included',
      credits: 1000,
      priceUSD: 8.99,
      metadata: { bonusPercentage: 10 },
      appleProductId: 'com.fun.app.credits.1000',
      googleProductId: 'credits_1000'
    },
    {
      sku: 'credits_2500',
      type: 'credits',
      name: '2500 Credits',
      description: '20% bonus credits included',
      credits: 2500,
      priceUSD: 19.99,
      metadata: { bonusPercentage: 20 },
      appleProductId: 'com.fun.app.credits.2500',
      googleProductId: 'credits_2500'
    },
    {
      sku: 'premium_monthly',
      type: 'subscription',
      name: 'Premium Monthly',
      description: 'Unlimited access to all premium content',
      priceUSD: 9.99,
      metadata: { 
        subscriptionDuration: 30,
        features: ['Unlimited episodes', 'No ads', 'Early access']
      },
      appleProductId: 'com.fun.app.premium.monthly',
      googleProductId: 'premium_monthly'
    },
    {
      sku: 'premium_annual',
      type: 'subscription',
      name: 'Premium Annual',
      description: 'Save 17% with yearly billing',
      priceUSD: 99.99,
      metadata: { 
        subscriptionDuration: 365,
        features: ['Unlimited episodes', 'No ads', 'Early access', '2 months free']
      },
      appleProductId: 'com.fun.app.premium.annual',
      googleProductId: 'premium_annual'
    }
  ];
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
