import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  keyGenerator?: (req: Request) => string; // Custom key generator
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      message: config.message || 'Too many requests, please try again later.',
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator
    };

    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  private defaultKeyGenerator(req: Request): string {
    // Use IP address as default key
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.store.delete(key));
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = this.config.keyGenerator(req);
      const now = Date.now();
      
      let entry = this.store.get(key);

      // Create new entry if doesn't exist or window has expired
      if (!entry || now > entry.resetTime) {
        entry = {
          count: 0,
          resetTime: now + this.config.windowMs
        };
        this.store.set(key, entry);
      }

      // Check if limit exceeded
      if (entry.count >= this.config.maxRequests) {
        const resetTimeSeconds = Math.ceil((entry.resetTime - now) / 1000);
        
        logger.warn('Rate limit exceeded', {
          key,
          count: entry.count,
          limit: this.config.maxRequests,
          resetIn: resetTimeSeconds
        });

        res.status(429).json({
          error: 'Rate limit exceeded',
          message: this.config.message,
          retryAfter: resetTimeSeconds,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime: new Date(entry.resetTime).toISOString()
        });
        return;
      }

      // Increment counter
      entry.count++;

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': this.config.maxRequests.toString(),
        'X-RateLimit-Remaining': (this.config.maxRequests - entry.count).toString(),
        'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
      });

      // Handle response to potentially skip counting
      const originalSend = res.send;
      res.send = function(body: any) {
        const statusCode = res.statusCode;
        
        // Decrement counter if we should skip this request
        if ((statusCode >= 200 && statusCode < 300 && this.config.skipSuccessfulRequests) ||
            (statusCode >= 400 && this.config.skipFailedRequests)) {
          if (entry) {
            entry.count = Math.max(0, entry.count - 1);
          }
        }

        return originalSend.call(this, body);
      }.bind(this);

      next();
    };
  }

  // Get current stats for a key
  getStats(key: string): { count: number; remaining: number; resetTime: Date } | null {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return null;
    }

    return {
      count: entry.count,
      remaining: this.config.maxRequests - entry.count,
      resetTime: new Date(entry.resetTime)
    };
  }

  // Reset limit for a specific key
  reset(key: string): boolean {
    return this.store.delete(key);
  }

  // Get all active keys (for monitoring)
  getActiveKeys(): string[] {
    this.cleanup();
    return Array.from(this.store.keys());
  }
}

// Pre-configured rate limiters for different use cases
export const createRateLimit = (config: RateLimitConfig) => {
  const limiter = new RateLimiter(config);
  return limiter.middleware();
};

// Common rate limit configurations
export const rateLimit = {
  // General API rate limit - 100 requests per 15 minutes
  general: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests from this IP, please try again later.'
  }),

  // Strict rate limit for sensitive endpoints - 10 requests per 15 minutes
  strict: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: 'Rate limit exceeded for sensitive endpoint.'
  }),

  // Lenient rate limit for public data - 1000 requests per hour
  lenient: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
    message: 'Hourly rate limit exceeded.'
  }),

  // Search rate limit - 50 requests per 10 minutes
  search: createRateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 50,
    message: 'Search rate limit exceeded, please try again later.'
  }),

  // Analysis rate limit - 20 requests per 30 minutes (for heavy operations)
  analysis: createRateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    maxRequests: 20,
    message: 'Analysis rate limit exceeded, please try again later.'
  })
};

// Custom rate limiter by user ID (if authentication is implemented)
export const createUserRateLimit = (config: RateLimitConfig) => {
  return createRateLimit({
    ...config,
    keyGenerator: (req: Request) => {
      // Try to get user ID from various sources
      const userId = req.headers['x-user-id'] || 
                    req.query.userId || 
                    req.body?.userId ||
                    req.ip;
      return `user:${userId}`;
    }
  });
};

// Rate limiter by API key (if API key authentication is implemented)
export const createApiKeyRateLimit = (config: RateLimitConfig) => {
  return createRateLimit({
    ...config,
    keyGenerator: (req: Request) => {
      const apiKey = req.headers['x-api-key'] || req.query.apiKey;
      return apiKey ? `api:${apiKey}` : `ip:${req.ip}`;
    }
  });
};
