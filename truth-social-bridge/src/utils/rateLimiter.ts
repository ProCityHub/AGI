import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// Create rate limiter instance
const rateLimiter = new RateLimiterRedis({
  storeClient: undefined, // Will be set when Redis is available
  keyPrefix: 'truth_social_bridge_rl',
  points: 100, // Number of requests
  duration: 900, // Per 15 minutes (900 seconds)
  blockDuration: 900, // Block for 15 minutes if limit exceeded
});

// Rate limiting middleware
export const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.ip || 'unknown';
    await rateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const remainingPoints = rejRes?.remainingPoints || 0;
    const msBeforeNext = rejRes?.msBeforeNext || 0;
    
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      remainingPoints,
      msBeforeNext,
      endpoint: req.path
    });
    
    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
      'X-RateLimit-Limit': 100,
      'X-RateLimit-Remaining': remainingPoints,
      'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString()
    });
    
    res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(msBeforeNext / 1000),
      timestamp: new Date().toISOString()
    });
  }
};

export { rateLimiter as rateLimiter };

