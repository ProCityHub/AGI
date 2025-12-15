import { Express } from 'express';
import { TruthSocialBridgeOrchestrator } from '../services/TruthSocialBridgeOrchestrator';
import { truthSocialRoutes } from './truthSocialRoutes';
import { analyticsRoutes } from './analyticsRoutes';
import { sentimentRoutes } from './sentimentRoutes';
import { trendsRoutes } from './trendsRoutes';
import { mediaRoutes } from './mediaRoutes';
import { politicalRoutes } from './politicalRoutes';
import { searchRoutes } from './searchRoutes';
import { webhookRoutes } from './webhookRoutes';

export function setupRoutes(app: Express, orchestrator: TruthSocialBridgeOrchestrator): void {
  // API version prefix
  const apiPrefix = '/api/v1';
  
  // Truth Social specific routes
  app.use(`${apiPrefix}/truth-social`, truthSocialRoutes(orchestrator));
  
  // Analytics and metrics routes
  app.use(`${apiPrefix}/analytics`, analyticsRoutes(orchestrator));
  
  // Sentiment analysis routes
  app.use(`${apiPrefix}/sentiment`, sentimentRoutes(orchestrator));
  
  // Trends and viral content routes
  app.use(`${apiPrefix}/trends`, trendsRoutes(orchestrator));
  
  // Media monitoring routes
  app.use(`${apiPrefix}/media`, mediaRoutes(orchestrator));
  
  // Political intelligence routes
  app.use(`${apiPrefix}/political`, politicalRoutes(orchestrator));
  
  // Search and discovery routes
  app.use(`${apiPrefix}/search`, searchRoutes(orchestrator));
  
  // Webhook routes for real-time updates
  app.use(`${apiPrefix}/webhooks`, webhookRoutes(orchestrator));
  
  // Root API info endpoint
  app.get(`${apiPrefix}`, (req, res) => {
    res.json({
      service: 'Truth Social AI Bridge',
      version: '1.0.0',
      description: 'Universal Bridge for Truth Social Platform & Donald Trump Digital Ecosystem',
      endpoints: {
        truthSocial: `${apiPrefix}/truth-social`,
        analytics: `${apiPrefix}/analytics`,
        sentiment: `${apiPrefix}/sentiment`,
        trends: `${apiPrefix}/trends`,
        media: `${apiPrefix}/media`,
        political: `${apiPrefix}/political`,
        search: `${apiPrefix}/search`,
        webhooks: `${apiPrefix}/webhooks`
      },
      documentation: 'https://github.com/ProCityHub/AGI/tree/main/truth-social-bridge/docs',
      status: orchestrator.isHealthy() ? 'operational' : 'degraded',
      timestamp: new Date().toISOString()
    });
  });
}

