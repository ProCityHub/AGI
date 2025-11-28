import winston from 'winston';
import path from 'path';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston that you want to link the colors
winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: logFormat
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: logFormat,
  transports,
  exitOnError: false
});

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.error(message);
    } else {
      logger.http(message);
    }
  });
  
  next();
};

// Export specific log functions for convenience
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: any) => {
  logger.error(message, { error: error?.message || error, stack: error?.stack });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

// Performance logging
export const logPerformance = (operation: string, startTime: number, meta?: any) => {
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${operation} completed in ${duration}ms`, meta);
};

// API request/response logging
export const logAPICall = (method: string, url: string, statusCode: number, duration: number) => {
  const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
  logger.log(level, `API ${method} ${url} ${statusCode} - ${duration}ms`);
};

// Truth Social specific logging
export const logTruthSocialEvent = (event: string, data?: any) => {
  logger.info(`Truth Social Event: ${event}`, { 
    event, 
    data: data ? JSON.stringify(data, null, 2) : undefined,
    timestamp: new Date().toISOString()
  });
};

export const logSentimentAnalysis = (postId: string, sentiment: any) => {
  logger.debug(`Sentiment Analysis: Post ${postId}`, {
    postId,
    sentiment: sentiment.compound,
    positive: sentiment.positive,
    negative: sentiment.negative,
    neutral: sentiment.neutral
  });
};

export const logTrendDetection = (trend: string, volume: number, growth: number) => {
  logger.info(`Trend Detection: ${trend}`, {
    trend,
    volume,
    growth: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`
  });
};

export const logMediaCoverage = (source: string, title: string, sentiment: number) => {
  logger.info(`Media Coverage: ${source}`, {
    source,
    title: title.substring(0, 100) + (title.length > 100 ? '...' : ''),
    sentiment: sentiment.toFixed(2)
  });
};

// Security logging
export const logSecurityEvent = (event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
  const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
  logger.log(level, `Security Event: ${event}`, {
    event,
    severity,
    details,
    timestamp: new Date().toISOString(),
    userAgent: details.userAgent,
    ip: details.ip
  });
};

// Rate limiting logging
export const logRateLimit = (ip: string, endpoint: string, limit: number) => {
  logger.warn(`Rate limit exceeded: ${ip} on ${endpoint}`, {
    ip,
    endpoint,
    limit,
    timestamp: new Date().toISOString()
  });
};

// Database operation logging
export const logDatabaseOperation = (operation: string, collection: string, duration: number, success: boolean) => {
  const level = success ? 'debug' : 'error';
  logger.log(level, `Database ${operation}: ${collection} - ${duration}ms`, {
    operation,
    collection,
    duration,
    success,
    timestamp: new Date().toISOString()
  });
};

export default logger;

