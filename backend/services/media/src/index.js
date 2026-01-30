/**
 * FUN App - Media Service
 * Handles video uploads, HLS transcoding, and CDN distribution
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { createClient } = require('redis');
const Queue = require('bull');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/error.middleware');

// Routes
const uploadRoutes = require('./routes/upload.routes');
const statusRoutes = require('./routes/status.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => logger.info('✅ Connected to MongoDB'))
.catch(err => {
  logger.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Connect to Redis
const redisClient = createClient({
  url: process.env.REDIS_URI || 'redis://localhost:6379'
});

redisClient.on('error', err => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('✅ Connected to Redis'));

(async () => {
  await redisClient.connect();
})();

app.set('redis', redisClient);

// Setup Bull Queue for transcoding jobs
const transcodingQueue = new Queue('video-transcoding', process.env.REDIS_URI || 'redis://localhost:6379', {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 100
  }
});

app.set('transcodingQueue', transcodingQueue);

// Start transcoding worker
if (process.env.TRANSCODING_ENABLED !== 'false') {
  const transcodingWorker = require('./workers/transcoding.worker');
  transcodingWorker(transcodingQueue);
  logger.info('🎬 Transcoding worker started');
}

// Health check
app.get('/health', (req, res) => {
  const health = {
    service: 'media-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisClient.isOpen ? 'connected' : 'disconnected',
    s3: process.env.AWS_S3_BUCKET ? 'configured' : 'not configured',
    transcoding: process.env.TRANSCODING_ENABLED !== 'false' ? 'enabled' : 'disabled'
  };
  
  const statusCode = health.mongodb === 'connected' && health.redis === 'connected' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/status', statusRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Media Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`S3 Bucket: ${process.env.AWS_S3_BUCKET || 'NOT CONFIGURED'}`);
  logger.info(`Transcoding: ${process.env.TRANSCODING_ENABLED !== 'false' ? 'Enabled' : 'Disabled'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing servers');
  await transcodingQueue.close();
  await mongoose.connection.close();
  await redisClient.quit();
  process.exit(0);
});

module.exports = app;
