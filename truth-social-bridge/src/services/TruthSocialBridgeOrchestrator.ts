import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { TruthSocialAPIService } from './TruthSocialAPIService';
import { SentimentAnalysisService } from './SentimentAnalysisService';
import { TrendDetectionService } from './TrendDetectionService';
import { MediaMonitoringService } from './MediaMonitoringService';
import { PoliticalIntelligenceService } from './PoliticalIntelligenceService';
import { ContentAnalysisService } from './ContentAnalysisService';
import { DataStorageService } from './DataStorageService';
import { NotificationService } from './NotificationService';
import { 
  TruthSocialPost, 
  AnalysisResult, 
  TrendData, 
  MediaCoverage,
  PoliticalEvent,
  BridgeMetrics 
} from '../types';

export class TruthSocialBridgeOrchestrator extends EventEmitter {
  private truthSocialAPI: TruthSocialAPIService;
  private sentimentAnalysis: SentimentAnalysisService;
  private trendDetection: TrendDetectionService;
  private mediaMonitoring: MediaMonitoringService;
  private politicalIntelligence: PoliticalIntelligenceService;
  private contentAnalysis: ContentAnalysisService;
  private dataStorage: DataStorageService;
  private notifications: NotificationService;
  
  private isInitialized = false;
  private isRunning = false;
  private metrics: BridgeMetrics;

  constructor() {
    super();
    
    // Initialize services
    this.truthSocialAPI = new TruthSocialAPIService();
    this.sentimentAnalysis = new SentimentAnalysisService();
    this.trendDetection = new TrendDetectionService();
    this.mediaMonitoring = new MediaMonitoringService();
    this.politicalIntelligence = new PoliticalIntelligenceService();
    this.contentAnalysis = new ContentAnalysisService();
    this.dataStorage = new DataStorageService();
    this.notifications = new NotificationService();
    
    // Initialize metrics
    this.metrics = {
      totalPosts: 0,
      activeTrends: 0,
      sentimentScore: 0,
      engagementRate: 0,
      lastUpdate: new Date(),
      systemHealth: 'healthy'
    };
    
    this.setupEventHandlers();
  }

  async initialize(): Promise<void> {
    try {
      logger.info('🔧 Initializing Truth Social Bridge Orchestrator...');
      
      // Initialize all services
      await Promise.all([
        this.truthSocialAPI.initialize(),
        this.sentimentAnalysis.initialize(),
        this.trendDetection.initialize(),
        this.mediaMonitoring.initialize(),
        this.politicalIntelligence.initialize(),
        this.contentAnalysis.initialize(),
        this.dataStorage.initialize(),
        this.notifications.initialize()
      ]);
      
      this.isInitialized = true;
      logger.info('✅ Truth Social Bridge Orchestrator initialized successfully');
      
      this.emit('initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize Truth Social Bridge Orchestrator:', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Orchestrator must be initialized before starting');
    }
    
    if (this.isRunning) {
      logger.warn('⚠️ Orchestrator is already running');
      return;
    }
    
    try {
      logger.info('🚀 Starting Truth Social Bridge operations...');
      
      // Start real-time data collection
      await this.startRealTimeCollection();
      
      // Start analysis pipelines
      await this.startAnalysisPipelines();
      
      // Start monitoring services
      await this.startMonitoringServices();
      
      this.isRunning = true;
      logger.info('✅ Truth Social Bridge is now operational');
      
      this.emit('started');
    } catch (error) {
      logger.error('❌ Failed to start Truth Social Bridge:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    
    try {
      logger.info('🛑 Stopping Truth Social Bridge operations...');
      
      // Stop all services gracefully
      await Promise.all([
        this.truthSocialAPI.stop(),
        this.mediaMonitoring.stop(),
        this.politicalIntelligence.stop()
      ]);
      
      this.isRunning = false;
      logger.info('✅ Truth Social Bridge stopped successfully');
      
      this.emit('stopped');
    } catch (error) {
      logger.error('❌ Error stopping Truth Social Bridge:', error);
      throw error;
    }
  }

  private async startRealTimeCollection(): Promise<void> {
    // Start Truth Social real-time data collection
    this.truthSocialAPI.on('newPost', this.handleNewPost.bind(this));
    this.truthSocialAPI.on('engagement', this.handleEngagement.bind(this));
    this.truthSocialAPI.on('trend', this.handleTrend.bind(this));
    
    await this.truthSocialAPI.startRealTimeCollection();
  }

  private async startAnalysisPipelines(): Promise<void> {
    // Start sentiment analysis pipeline
    this.sentimentAnalysis.on('analysisComplete', this.handleSentimentAnalysis.bind(this));
    
    // Start trend detection
    this.trendDetection.on('trendDetected', this.handleTrendDetection.bind(this));
    
    // Start content analysis
    this.contentAnalysis.on('analysisComplete', this.handleContentAnalysis.bind(this));
  }

  private async startMonitoringServices(): Promise<void> {
    // Start media monitoring
    this.mediaMonitoring.on('newCoverage', this.handleMediaCoverage.bind(this));
    
    // Start political intelligence
    this.politicalIntelligence.on('politicalEvent', this.handlePoliticalEvent.bind(this));
  }

  private async handleNewPost(post: TruthSocialPost): Promise<void> {
    try {
      logger.debug(`📝 Processing new Truth Social post: ${post.id}`);
      
      // Store the post
      await this.dataStorage.storePost(post);
      
      // Queue for sentiment analysis
      await this.sentimentAnalysis.analyzePost(post);
      
      // Queue for content analysis
      await this.contentAnalysis.analyzePost(post);
      
      // Update metrics
      this.metrics.totalPosts++;
      this.metrics.lastUpdate = new Date();
      
      // Emit event for real-time updates
      this.emit('postProcessed', {
        post,
        timestamp: new Date()
      });
      
    } catch (error) {
      logger.error('❌ Error handling new post:', error);
    }
  }

  private async handleEngagement(engagement: any): Promise<void> {
    try {
      logger.debug(`👥 Processing engagement data: ${engagement.postId}`);
      
      // Store engagement data
      await this.dataStorage.storeEngagement(engagement);
      
      // Update engagement metrics
      this.updateEngagementMetrics(engagement);
      
      // Emit event for real-time updates
      this.emit('engagementProcessed', {
        engagement,
        timestamp: new Date()
      });
      
    } catch (error) {
      logger.error('❌ Error handling engagement:', error);
    }
  }

  private async handleTrend(trend: any): Promise<void> {
    try {
      logger.debug(`📈 Processing trend data: ${trend.topic}`);
      
      // Store trend data
      await this.dataStorage.storeTrend(trend);
      
      // Update trend metrics
      this.metrics.activeTrends = await this.trendDetection.getActiveTrendCount();
      
      // Emit event for real-time updates
      this.emit('trendProcessed', {
        trend,
        timestamp: new Date()
      });
      
    } catch (error) {
      logger.error('❌ Error handling trend:', error);
    }
  }

  private async handleSentimentAnalysis(analysis: AnalysisResult): Promise<void> {
    try {
      logger.debug(`🎭 Processing sentiment analysis: ${analysis.postId}`);
      
      // Store analysis results
      await this.dataStorage.storeSentimentAnalysis(analysis);
      
      // Update sentiment metrics
      this.updateSentimentMetrics(analysis);
      
      // Check for significant sentiment changes
      await this.checkSentimentAlerts(analysis);
      
      // Emit event for real-time updates
      this.emit('sentimentAnalyzed', {
        analysis,
        timestamp: new Date()
      });
      
    } catch (error) {
      logger.error('❌ Error handling sentiment analysis:', error);
    }
  }

  private async handleTrendDetection(trendData: TrendData): Promise<void> {
    try {
      logger.debug(`🔍 Processing trend detection: ${trendData.topic}`);
      
      // Store trend detection results
      await this.dataStorage.storeTrendData(trendData);
      
      // Check for viral content
      if (trendData.viralPotential > 0.8) {
        await this.notifications.sendViralAlert(trendData);
      }
      
      // Emit event for real-time updates
      this.emit('trendDetected', {
        trendData,
        timestamp: new Date()
      });
      
    } catch (error) {
      logger.error('❌ Error handling trend detection:', error);
    }
  }

  private async handleContentAnalysis(analysis: any): Promise<void> {
    try {
      logger.debug(`📊 Processing content analysis: ${analysis.postId}`);
      
      // Store content analysis results
      await this.dataStorage.storeContentAnalysis(analysis);
      
      // Check for policy-related content
      if (analysis.categories.includes('policy')) {
        await this.politicalIntelligence.processPolicyContent(analysis);
      }
      
      // Emit event for real-time updates
      this.emit('contentAnalyzed', {
        analysis,
        timestamp: new Date()
      });
      
    } catch (error) {
      logger.error('❌ Error handling content analysis:', error);
    }
  }

  private async handleMediaCoverage(coverage: MediaCoverage): Promise<void> {
    try {
      logger.debug(`📰 Processing media coverage: ${coverage.source}`);
      
      // Store media coverage data
      await this.dataStorage.storeMediaCoverage(coverage);
      
      // Analyze coverage sentiment
      await this.sentimentAnalysis.analyzeMediaCoverage(coverage);
      
      // Emit event for real-time updates
      this.emit('mediaCoverageProcessed', {
        coverage,
        timestamp: new Date()
      });
      
    } catch (error) {
      logger.error('❌ Error handling media coverage:', error);
    }
  }

  private async handlePoliticalEvent(event: PoliticalEvent): Promise<void> {
    try {
      logger.debug(`🏛️ Processing political event: ${event.type}`);
      
      // Store political event data
      await this.dataStorage.storePoliticalEvent(event);
      
      // Trigger enhanced monitoring
      if (event.significance === 'high') {
        await this.truthSocialAPI.enableEnhancedMonitoring();
      }
      
      // Emit event for real-time updates
      this.emit('politicalEventProcessed', {
        event,
        timestamp: new Date()
      });
      
    } catch (error) {
      logger.error('❌ Error handling political event:', error);
    }
  }

  private updateEngagementMetrics(engagement: any): void {
    // Calculate rolling engagement rate
    // Implementation would include sophisticated engagement calculations
    this.metrics.engagementRate = this.calculateEngagementRate(engagement);
    this.metrics.lastUpdate = new Date();
  }

  private updateSentimentMetrics(analysis: AnalysisResult): void {
    // Calculate rolling sentiment score
    // Implementation would include weighted sentiment calculations
    this.metrics.sentimentScore = this.calculateAverageSentiment(analysis);
    this.metrics.lastUpdate = new Date();
  }

  private async checkSentimentAlerts(analysis: AnalysisResult): Promise<void> {
    // Check for significant sentiment shifts
    if (Math.abs(analysis.sentiment.compound) > 0.8) {
      await this.notifications.sendSentimentAlert(analysis);
    }
  }

  private calculateEngagementRate(engagement: any): number {
    // Sophisticated engagement rate calculation
    // This would include likes, shares, comments, etc.
    return 0; // Placeholder
  }

  private calculateAverageSentiment(analysis: AnalysisResult): number {
    // Rolling average sentiment calculation
    return analysis.sentiment.compound;
  }

  private setupEventHandlers(): void {
    this.on('error', (error) => {
      logger.error('🚨 Orchestrator error:', error);
      this.metrics.systemHealth = 'degraded';
    });
    
    this.on('warning', (warning) => {
      logger.warn('⚠️ Orchestrator warning:', warning);
    });
  }

  // Public API methods
  public getMetrics(): BridgeMetrics {
    return { ...this.metrics };
  }

  public async getRecentPosts(limit: number = 50): Promise<TruthSocialPost[]> {
    return this.dataStorage.getRecentPosts(limit);
  }

  public async getTrendingTopics(limit: number = 10): Promise<TrendData[]> {
    return this.trendDetection.getTrendingTopics(limit);
  }

  public async getSentimentAnalysis(timeframe: string = '24h'): Promise<any> {
    return this.sentimentAnalysis.getAggregatedSentiment(timeframe);
  }

  public async getMediaCoverage(timeframe: string = '24h'): Promise<MediaCoverage[]> {
    return this.mediaMonitoring.getRecentCoverage(timeframe);
  }

  public async searchPosts(query: string, filters?: any): Promise<TruthSocialPost[]> {
    return this.dataStorage.searchPosts(query, filters);
  }

  public isHealthy(): boolean {
    return this.isInitialized && this.isRunning && this.metrics.systemHealth === 'healthy';
  }
}

