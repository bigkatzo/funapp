/**
 * Webhook Controller
 * Handles Stripe webhooks for subscription updates
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/transaction.model');
const axios = require('axios');
const logger = require('../utils/logger');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
    
  } catch (error) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

/**
 * Handle successful invoice payment (subscription renewal)
 */
async function handleInvoicePaymentSucceeded(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata.userId;
  
  if (!userId) {
    logger.warn('No userId in subscription metadata');
    return;
  }
  
  // Extend premium access
  const expiresAt = new Date(subscription.current_period_end * 1000);
  
  try {
    await axios.post(
      `${AUTH_SERVICE_URL}/api/auth/premium/extend`,
      { expiresAt },
      {
        headers: {
          'X-Service-Key': process.env.SERVICE_API_KEY || 'dev-service-key'
        }
      }
    );
    
    // Create transaction record
    await Transaction.create({
      userId,
      type: 'subscription',
      amount: invoice.amount_paid / 100,
      currency: 'USD',
      paymentMethod: 'stripe',
      transactionId: invoice.id,
      metadata: {
        subscriptionId: subscription.id,
        subscriptionTier: subscription.metadata.productSku
      },
      status: 'completed'
    });
    
    logger.info(`Subscription renewed for user ${userId}`);
  } catch (error) {
    logger.error('Failed to extend premium:', error);
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata.userId;
  
  logger.warn(`Payment failed for user ${userId}, subscription ${subscription.id}`);
  
  // Optionally notify user (send email/push notification)
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata.userId;
  
  if (!userId) {
    logger.warn('No userId in subscription metadata');
    return;
  }
  
  try {
    // Deactivate premium
    await axios.post(
      `${AUTH_SERVICE_URL}/api/auth/premium/deactivate`,
      {},
      {
        headers: {
          'X-Service-Key': process.env.SERVICE_API_KEY || 'dev-service-key'
        }
      }
    );
    
    logger.info(`Subscription cancelled for user ${userId}`);
  } catch (error) {
    logger.error('Failed to deactivate premium:', error);
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata.userId;
  
  if (!userId) {
    logger.warn('No userId in subscription metadata');
    return;
  }
  
  // Update expiration date if changed
  const expiresAt = new Date(subscription.current_period_end * 1000);
  
  try {
    await axios.post(
      `${AUTH_SERVICE_URL}/api/auth/premium/extend`,
      { expiresAt },
      {
        headers: {
          'X-Service-Key': process.env.SERVICE_API_KEY || 'dev-service-key'
        }
      }
    );
    
    logger.info(`Subscription updated for user ${userId}`);
  } catch (error) {
    logger.error('Failed to update premium:', error);
  }
}

module.exports = exports;
