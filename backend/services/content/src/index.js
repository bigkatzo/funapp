/**
 * FUN App - Content Service
 * Handles series, episodes, unlocks, feed, and user interactions
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { createClient } = require('redis');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/error.middleware');

// Routes
const seriesRoutes = require('./routes/series.routes');
const unlockRoutes = require('./routes/unlock.routes');
const feedRoutes = require('./routes/feed.routes');
const interactionRoutes = require('./routes/interaction.routes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const SOCKET_PORT = process.env.SOCKET_PORT || 3010;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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

// Setup Socket.IO for real-time features
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  
  // Join series room
  socket.on('join-series', (seriesId) => {
    socket.join(`series:${seriesId}`);
    logger.info(`Socket ${socket.id} joined series:${seriesId}`);
  });
  
  // Leave series room
  socket.on('leave-series', (seriesId) => {
    socket.leave(`series:${seriesId}`);
  });
  
  // Like event
  socket.on('like', async (data) => {
    const { seriesId, userId } = data;
    io.to(`series:${seriesId}`).emit('like-updated', { seriesId, userId });
  });
  
  // Comment event
  socket.on('comment', async (data) => {
    const { seriesId, comment } = data;
    io.to(`series:${seriesId}`).emit('new-comment', comment);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

app.set('io', io);

// Health check
app.get('/health', (req, res) => {
  const health = {
    service: 'content-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisClient.isOpen ? 'connected' : 'disconnected'
  };
  
  const statusCode = health.mongodb === 'connected' && health.redis === 'connected' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API Routes
app.use('/api/series', seriesRoutes);
app.use('/api/unlock', unlockRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api', interactionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use(errorHandler);

// Start HTTP server
app.listen(PORT, () => {
  logger.info(`🚀 Content Service (HTTP) running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Start Socket.IO server
server.listen(SOCKET_PORT, () => {
  logger.info(`🔌 Socket.IO server running on port ${SOCKET_PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing servers');
  await mongoose.connection.close();
  await redisClient.quit();
  server.close();
  process.exit(0);
});

module.exports = app;
