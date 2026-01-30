/**
 * IAP Controller
 * Handles Apple and Google In-App Purchase verification
 */

const axios = require('axios');
const Transaction = require('../models/transaction.model');
const Product = require('../models/product.model');
const logger = require('../utils/logger');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const APPLE_SHARED_SECRET = process.env.APPLE_SHARED_SECRET;
const APPLE_VERIFY_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

/**
 * POST /api/iap/verify/apple
 * Verify Apple IAP receipt
 */
exports.verifyAppleReceipt = async (req, res) => {
  try {
    const { receiptData, productId } = req.body;
    const userId = req.userId;
    
    if (!receiptData || !productId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Receipt data and product ID are required'
      });
    }
    
    // Find product in database
    const product = await Product.findOne({ 
      appleProductId: productId, 
      isActive: true 
    });
    
    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found'
      });
    }
    
    // Verify with Apple
    let appleResponse = await verifyWithApple(receiptData, APPLE_VERIFY_URL);
    
    // If production verification fails with 21007, try sandbox
    if (appleResponse.status === 21007) {
      appleResponse = await verifyWithApple(receiptData, APPLE_SANDBOX_URL);
    }
    
    if (appleResponse.status !== 0) {
      logger.error('Apple receipt verification failed:', appleResponse);
      return res.status(400).json({
        error: 'Invalid Receipt',
        message: 'Receipt verification failed',
        appleStatus: appleResponse.status
      });
    }
    
    // Extract transaction info
    const receipt = appleResponse.receipt;
    const transactionId = receipt.transaction_id || receipt.original_transaction_id;
    
    // Check if transaction already processed
    const existing = await Transaction.findOne({ transactionId });
    if (existing) {
      return res.json({
        success: true,
        alreadyProcessed: true,
        message: 'Receipt already processed'
      });
    }
    
    // Process based on product type
    if (product.type === 'credits') {
      // Add credits to user account
      await axios.post(
        `${AUTH_SERVICE_URL}/api/auth/credits/add`,
        { amount: product.credits },
        { headers: { Authorization: req.headers.authorization } }
      );
      
      await Transaction.createCreditPurchase(
        userId,
        product.credits,
        'apple_iap',
        transactionId,
        product.sku
      );
      
      logger.info(`User ${userId} purchased ${product.credits} credits via Apple IAP`);
      
      res.json({
        success: true,
        credits: product.credits,
        transactionId,
        message: `Successfully purchased ${product.credits} credits`
      });
      
    } else if (product.type === 'subscription') {
      // Activate subscription
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + product.metadata.subscriptionDuration);
      
      await axios.post(
        `${AUTH_SERVICE_URL}/api/auth/premium/activate`,
        { 
          tier: product.sku.includes('annual') ? 'annual' : 'monthly',
          expiresAt 
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      
      await Transaction.createSubscription(
        userId,
        product.priceUSD,
        'apple_iap',
        transactionId,
        product.name
      );
      
      logger.info(`User ${userId} activated premium subscription via Apple IAP`);
      
      res.json({
        success: true,
        subscription: {
          tier: product.name,
          expiresAt
        },
        transactionId,
        message: 'Subscription activated successfully'
      });
    }
    
  } catch (error) {
    logger.error('Apple IAP verification error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify receipt'
    });
  }
};

/**
 * POST /api/iap/verify/google
 * Verify Google Play purchase
 */
exports.verifyGooglePurchase = async (req, res) => {
  try {
    const { purchaseToken, productId, packageName } = req.body;
    const userId = req.userId;
    
    if (!purchaseToken || !productId || !packageName) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Purchase token, product ID, and package name are required'
      });
    }
    
    // Find product in database
    const product = await Product.findOne({ 
      googleProductId: productId, 
      isActive: true 
    });
    
    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found'
      });
    }
    
    // In production, verify with Google Play Developer API
    // For MVP, we'll accept the purchase token as-is
    // TODO: Implement proper Google Play API verification
    
    // Check if transaction already processed
    const existing = await Transaction.findOne({ transactionId: purchaseToken });
    if (existing) {
      return res.json({
        success: true,
        alreadyProcessed: true,
        message: 'Purchase already processed'
      });
    }
    
    // Process based on product type
    if (product.type === 'credits') {
      await axios.post(
        `${AUTH_SERVICE_URL}/api/auth/credits/add`,
        { amount: product.credits },
        { headers: { Authorization: req.headers.authorization } }
      );
      
      await Transaction.createCreditPurchase(
        userId,
        product.credits,
        'google_play',
        purchaseToken,
        product.sku
      );
      
      logger.info(`User ${userId} purchased ${product.credits} credits via Google Play`);
      
      res.json({
        success: true,
        credits: product.credits,
        transactionId: purchaseToken,
        message: `Successfully purchased ${product.credits} credits`
      });
      
    } else if (product.type === 'subscription') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + product.metadata.subscriptionDuration);
      
      await axios.post(
        `${AUTH_SERVICE_URL}/api/auth/premium/activate`,
        { 
          tier: product.sku.includes('annual') ? 'annual' : 'monthly',
          expiresAt 
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      
      await Transaction.createSubscription(
        userId,
        product.priceUSD,
        'google_play',
        purchaseToken,
        product.name
      );
      
      logger.info(`User ${userId} activated premium subscription via Google Play`);
      
      res.json({
        success: true,
        subscription: {
          tier: product.name,
          expiresAt
        },
        transactionId: purchaseToken,
        message: 'Subscription activated successfully'
      });
    }
    
  } catch (error) {
    logger.error('Google Play verification error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify purchase'
    });
  }
};

/**
 * Helper: Verify receipt with Apple
 */
async function verifyWithApple(receiptData, url) {
  try {
    const response = await axios.post(url, {
      'receipt-data': receiptData,
      'password': APPLE_SHARED_SECRET,
      'exclude-old-transactions': true
    });
    
    return response.data;
  } catch (error) {
    logger.error('Apple verification request failed:', error);
    throw error;
  }
}

module.exports = exports;
