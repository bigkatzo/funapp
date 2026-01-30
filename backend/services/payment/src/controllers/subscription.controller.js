/**
 * Subscription Controller
 * Manages premium subscriptions
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/transaction.model');
const Product = require('../models/product.model');
const axios = require('axios');
const logger = require('../utils/logger');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

/**
 * POST /api/subscription/create
 * Create subscription via Stripe
 */
exports.createSubscription = async (req, res) => {
  try {
    const { productSku, paymentMethodId } = req.body;
    const userId = req.userId;
    
    if (!productSku || !paymentMethodId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Product SKU and payment method ID are required'
      });
    }
    
    // Get product
    const product = await Product.findOne({ 
      sku: productSku, 
      type: 'subscription', 
      isActive: true 
    });
    
    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Subscription product not found'
      });
    }
    
    // Get user email from Auth Service
    const userResponse = await axios.get(
      `${AUTH_SERVICE_URL}/api/auth/profile`,
      { headers: { Authorization: req.headers.authorization } }
    );
    const user = userResponse.data.user;
    
    // Create or get Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: userId.toString() }
      });
    }
    
    // Attach payment method
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id
    });
    
    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
    
    // Create Stripe price if not exists
    let stripePriceId = product.stripePriceId;
    if (!stripePriceId) {
      const price = await stripe.prices.create({
        product_data: {
          name: product.name,
          metadata: { productSku: product.sku }
        },
        unit_amount: Math.round(product.priceUSD * 100),
        currency: 'usd',
        recurring: {
          interval: product.sku.includes('annual') ? 'year' : 'month'
        }
      });
      
      stripePriceId = price.id;
      product.stripePriceId = stripePriceId;
      await product.save();
    }
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: stripePriceId }],
      metadata: {
        userId: userId.toString(),
        productSku: product.sku
      }
    });
    
    // Activate premium in Auth Service
    const expiresAt = new Date(subscription.current_period_end * 1000);
    await axios.post(
      `${AUTH_SERVICE_URL}/api/auth/premium/activate`,
      { 
        tier: product.sku.includes('annual') ? 'annual' : 'monthly',
        expiresAt 
      },
      { headers: { Authorization: req.headers.authorization } }
    );
    
    // Create transaction record
    await Transaction.createSubscription(
      userId,
      product.priceUSD,
      'stripe',
      subscription.id,
      product.name
    );
    
    logger.info(`User ${userId} created subscription via Stripe: ${product.name}`);
    
    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        tier: product.name,
        status: subscription.status,
        currentPeriodEnd: expiresAt
      },
      message: 'Subscription created successfully'
    });
    
  } catch (error) {
    if (error.type && error.type.startsWith('Stripe')) {
      return res.status(400).json({
        error: 'Stripe Error',
        message: error.message
      });
    }
    
    logger.error('Create subscription error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create subscription'
    });
  }
};

/**
 * POST /api/subscription/cancel
 * Cancel subscription
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const userId = req.userId;
    
    if (!subscriptionId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Subscription ID is required'
      });
    }
    
    // Cancel at period end (user keeps access until then)
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
    
    logger.info(`User ${userId} cancelled subscription: ${subscriptionId}`);
    
    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      },
      message: 'Subscription will be cancelled at the end of billing period'
    });
    
  } catch (error) {
    logger.error('Cancel subscription error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to cancel subscription'
    });
  }
};

/**
 * GET /api/subscription/status
 * Get subscription status
 */
exports.getStatus = async (req, res) => {
  try {
    const userResponse = await axios.get(
      `${AUTH_SERVICE_URL}/api/auth/profile`,
      { headers: { Authorization: req.headers.authorization } }
    );
    
    const user = userResponse.data.user;
    
    res.json({
      isPremium: user.isPremium,
      premiumTier: user.premiumTier,
      premiumExpiresAt: user.premiumExpiresAt
    });
    
  } catch (error) {
    logger.error('Get subscription status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch subscription status'
    });
  }
};

/**
 * GET /api/subscription/products
 * Get available subscription products
 */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      type: 'subscription', 
      isActive: true 
    }).sort({ priceUSD: 1 });
    
    res.json({
      products
    });
    
  } catch (error) {
    logger.error('Get subscription products error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch products'
    });
  }
};

module.exports = exports;
