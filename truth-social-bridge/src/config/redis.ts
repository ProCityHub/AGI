import { createClient } from 'redis';
import { logger } from '../utils/logger';

let redisClient: any;

export async function initializeRedis(): Promise<void> {
  try {
    redisClient = createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DATABASE || '0'),
    });
    
    redisClient.on('error', (error: any) => {
      logger.error('❌ Redis connection error:', error);
    });
    
    redisClient.on('connect', () => {
      logger.info('🔄 Redis connecting...');
    });
    
    redisClient.on('ready', () => {
      logger.info('✅ Redis connected successfully');
    });
    
    redisClient.on('end', () => {
      logger.warn('⚠️ Redis connection ended');
    });
    
    await redisClient.connect();
    
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
}

export function getRedisClient() {
  return redisClient;
}

