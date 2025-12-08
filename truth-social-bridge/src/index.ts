import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { setupRoutes } from './routes';
import { TruthSocialBridgeOrchestrator } from './services/TruthSocialBridgeOrchestrator';
import { startDataSyncScheduler } from './services/DataSyncScheduler';
import { setupSocketHandlers } from './services/SocketService';
import { rateLimiter } from './utils/rateLimiter';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Truth Social Bridge',
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// System status endpoint
app.get('/status', async (req, res) => {
  try {
    const status = {
      service: 'Truth Social AI Bridge',
      status: 'operational',
      timestamp: new Date().toISOString(),
      components: {
        database: 'healthy',
        redis: 'healthy',
        truthSocialAPI: 'connected',
        aiProcessing: 'active',
        realTimeSync: 'running'
      },
      metrics: {
        totalPosts: 0, // Will be populated by orchestrator
        activeTrends: 0,
        sentimentScore: 0,
        engagementRate: 0
      }
    };
    
    res.status(200).json(status);
  } catch (error) {
    logger.error('Status check failed:', error);
    res.status(503).json({
      service: 'Truth Social AI Bridge',
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: 'Service temporarily unavailable'
    });
  }
});

// Initialize services and start server
async function startServer() {
  try {
    logger.info('🚀 Starting Truth Social AI Bridge System...');
    
    // Initialize database connections
    await connectDatabase();
    await initializeRedis();
    
    // Initialize the bridge orchestrator
    const bridgeOrchestrator = new TruthSocialBridgeOrchestrator();
    await bridgeOrchestrator.initialize();
    
    // Setup API routes
    setupRoutes(app, bridgeOrchestrator);
    
    // Setup WebSocket handlers
    setupSocketHandlers(io, bridgeOrchestrator);
    
    // Start data synchronization scheduler
    startDataSyncScheduler(bridgeOrchestrator);
    
    // Start the server
    server.listen(PORT, () => {
      logger.info(`🇺🇸 Truth Social AI Bridge System started on port ${PORT}`);
      logger.info('🌉 Bridging Truth Social platform and Trump digital ecosystem');
      logger.info('🤖 AI-powered political intelligence and content analysis active');
      logger.info('📊 Real-time sentiment analysis and trend detection enabled');
      logger.info('🔒 Privacy-compliant data processing initialized');
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

