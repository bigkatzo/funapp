/**
 * Transaction Controller
 * View transaction history
 */

const Transaction = require('../models/transaction.model');
const logger = require('../utils/logger');

/**
 * GET /api/transactions
 * Get user's transaction history
 */
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 50, type, status } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = { userId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(filter)
    ]);
    
    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    logger.error('Get transactions error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch transactions'
    });
  }
};

/**
 * GET /api/transactions/:id
 * Get specific transaction details
 */
exports.getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const transaction = await Transaction.findOne({ _id: id, userId });
    
    if (!transaction) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Transaction not found'
      });
    }
    
    res.json(transaction);
    
  } catch (error) {
    logger.error('Get transaction error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch transaction'
    });
  }
};

module.exports = exports;
