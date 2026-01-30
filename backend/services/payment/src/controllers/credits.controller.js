/**
 * Credits Controller
 * Handles credit purchases and spending
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/transaction.model');
const Product = require('../models/product.model');
const axios = require('axios');
const logger = require('../utils/logger');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

/**
 * POST /api/credits/buy
 * Purchase credits via Stripe
 */
exports.buyCredits = async (req, res) => {
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
    const product = await Product.findOne({ sku: productSku, type: 'credits', isActive: true });
    
    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found or inactive'
      });
    }
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(product.priceUSD * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        userId: userId.toString(),
        productSku: product.sku,
        credits: product.credits.toString()
      }
    });
    
    if (paymentIntent.status === 'succeeded') {
      // Add credits to user account
      await axios.post(
        `${AUTH_SERVICE_URL}/api/auth/credits/add`,
        { amount: product.credits },
        { headers: { Authorization: req.headers.authorization } }
      );
      
      // Create transaction record
      await Transaction.createCreditPurchase(
        userId,
        product.credits,
        'stripe',
        paymentIntent.id,
        product.sku
      );
      
      logger.info(`User ${userId} purchased ${product.credits} credits via Stripe`);
      
      res.json({
        success: true,
        credits: product.credits,
        transactionId: paymentIntent.id,
        message: `Successfully purchased ${product.credits} credits`
      });
    } else {
      res.status(400).json({
        error: 'Payment Failed',
        message: 'Payment did not complete successfully',
        status: paymentIntent.status
      });
    }
    
  } catch (error) {
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: 'Card Error',
        message: error.message
      });
    }
    
    logger.error('Buy credits error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process credit purchase'
    });
  }
};

/**
 * POST /api/credits/spend
 * Spend credits (called by other services)
 */
exports.spendCredits = async (req, res) => {
  try {
    const { amount, seriesId, episodeNum } = req.body;
    const userId = req.userId;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Valid credit amount is required'
      });
    }
    
    // Get user's current balance
    const userResponse = await axios.get(
      `${AUTH_SERVICE_URL}/api/auth/profile`,
      { headers: { Authorization: req.headers.authorization } }
    );
    
    const user = userResponse.data.user;
    
    if (user.credits < amount) {
      return res.status(400).json({
        error: 'Insufficient Credits',
        message: `You have ${user.credits} credits, but need ${amount}`,
        creditsNeeded: amount - user.credits
      });
    }
    
    // Deduct credits
    await axios.post(
      `${AUTH_SERVICE_URL}/api/auth/credits/deduct`,
      { amount },
      { headers: { Authorization: req.headers.authorization } }
    );
    
    // Create transaction record
    if (seriesId && episodeNum) {
      await Transaction.createCreditSpend(userId, amount, seriesId, episodeNum);
    }
    
    logger.info(`User ${userId} spent ${amount} credits`);
    
    res.json({
      success: true,
      creditsRemaining: user.credits - amount,
      message: `Successfully spent ${amount} credits`
    });
    
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return res.status(400).json(error.response.data);
    }
    
    logger.error('Spend credits error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to spend credits'
    });
  }
};

/**
 * GET /api/credits/balance
 * Get user's credit balance
 */
exports.getBalance = async (req, res) => {
  try {
    const userId = req.userId;
    
    const userResponse = await axios.get(
      `${AUTH_SERVICE_URL}/api/auth/profile`,
      { headers: { Authorization: req.headers.authorization } }
    );
    
    const user = userResponse.data.user;
    
    res.json({
      credits: user.credits,
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt
    });
    
  } catch (error) {
    logger.error('Get balance error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch balance'
    });
  }
};

/**
 * GET /api/credits/products
 * Get available credit packages
 */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      type: 'credits', 
      isActive: true 
    }).sort({ priceUSD: 1 });
    
    res.json({
      products
    });
    
  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch products'
    });
  }
};

module.exports = exports;
