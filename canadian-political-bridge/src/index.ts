import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { setupRoutes } from './routes';
import { BridgeOrchestrator } from './services/BridgeOrchestrator';
import { startDataSyncScheduler } from './services/DataSyncScheduler';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Canadian Political Bridge',
    version: '1.0.0'
  });
});

// Initialize services and start server
async function startServer() {
  try {
    // Initialize database connections
    await connectDatabase();
    await initializeRedis();
    
    // Initialize the bridge orchestrator
    const bridgeOrchestrator = new BridgeOrchestrator();
    await bridgeOrchestrator.initialize();
    
    // Setup API routes
    setupRoutes(app, bridgeOrchestrator);
    
    // Start data synchronization scheduler
    startDataSyncScheduler(bridgeOrchestrator);
    
    // Start the server
    server.listen(PORT, () => {
      logger.info(`🇨🇦 Canadian Political Bridge System started on port ${PORT}`);
      logger.info('🌉 Bridging all Canadian political parties and government repositories');
      logger.info('🚀 System ready for political intelligence processing');
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
