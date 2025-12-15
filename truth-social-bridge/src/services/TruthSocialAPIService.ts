import { EventEmitter } from 'events';
import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { TruthSocialPost, TruthSocialUser, EngagementMetrics } from '../types';

export class TruthSocialAPIService extends EventEmitter {
  private apiClient: AxiosInstance;
  private isInitialized = false;
  private isCollecting = false;
  private collectionInterval?: NodeJS.Timeout;
  private enhancedMode = false;

  constructor() {
    super();
    
    this.apiClient = axios.create({
      baseURL: process.env.TRUTH_SOCIAL_API_BASE_URL || 'https://truthsocial.com/api/v1',
      timeout: 30000,
      headers: {
        'User-Agent': 'TruthSocial-Bridge/1.0.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  async initialize(): Promise<void> {
    try {
      logger.info('🔧 Initializing Truth Social API Service...');
      
      // Set up authentication
      await this.setupAuthentication();
      
      // Test API connection
      await this.testConnection();
      
      this.isInitialized = true;
      logger.info('✅ Truth Social API Service initialized successfully');
      
    } catch (error) {
      logger.error('❌ Failed to initialize Truth Social API Service:', error);
      throw error;
    }
  }

  async startRealTimeCollection(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Service must be initialized before starting collection');
    }

    if (this.isCollecting) {
      logger.warn('⚠️ Real-time collection is already running');
      return;
    }

    try {
      logger.info('🚀 Starting real-time Truth Social data collection...');
      
      // Start collecting posts
      this.startPostCollection();
      
      // Start collecting trends
      this.startTrendCollection();
      
      // Start collecting engagement data
      this.startEngagementCollection();
      
      this.isCollecting = true;
      logger.info('✅ Real-time collection started successfully');
      
    } catch (error) {
      logger.error('❌ Failed to start real-time collection:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isCollecting) {
      return;
    }

    try {
      logger.info('🛑 Stopping Truth Social API Service...');
      
      if (this.collectionInterval) {
        clearInterval(this.collectionInterval);
      }
      
      this.isCollecting = false;
      logger.info('✅ Truth Social API Service stopped successfully');
      
    } catch (error) {
      logger.error('❌ Error stopping Truth Social API Service:', error);
      throw error;
    }
  }

  async enableEnhancedMonitoring(): Promise<void> {
    this.enhancedMode = true;
    logger.info('🔍 Enhanced monitoring mode enabled');
    
    // Increase collection frequency during enhanced mode
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.startPostCollection(5000); // 5 second intervals instead of 30
    }
  }

  async disableEnhancedMonitoring(): Promise<void> {
    this.enhancedMode = false;
    logger.info('🔍 Enhanced monitoring mode disabled');
    
    // Return to normal collection frequency
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.startPostCollection(); // Back to 30 second intervals
    }
  }

  private async setupAuthentication(): Promise<void> {
    const apiKey = process.env.TRUTH_SOCIAL_API_KEY;
    const apiSecret = process.env.TRUTH_SOCIAL_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      logger.warn('⚠️ Truth Social API credentials not found, using public endpoints only');
      return;
    }

    // Set up authentication headers
    this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
    
    logger.info('🔐 Truth Social API authentication configured');
  }

  private async testConnection(): Promise<void> {
    try {
      // Test with a simple public endpoint
      const response = await this.apiClient.get('/instance');
      logger.info('✅ Truth Social API connection test successful');
      
    } catch (error) {
      logger.warn('⚠️ Truth Social API connection test failed, will use mock data:', error);
      // Don't throw error - we can operate with mock data for development
    }
  }

  private setupInterceptors(): void {
    // Request interceptor for rate limiting
    this.apiClient.interceptors.request.use(
      (config) => {
        logger.debug(`📤 Truth Social API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('❌ Truth Social API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => {
        logger.debug(`📥 Truth Social API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response?.status === 429) {
          logger.warn('⚠️ Truth Social API rate limit exceeded, backing off...');
          // Implement exponential backoff
        } else if (error.response?.status === 401) {
          logger.error('🔐 Truth Social API authentication failed');
        }
        
        logger.error('❌ Truth Social API Response Error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  private startPostCollection(interval: number = 30000): void {
    this.collectionInterval = setInterval(async () => {
      try {
        await this.collectRecentPosts();
      } catch (error) {
        logger.error('❌ Error collecting posts:', error);
      }
    }, interval);
  }

  private startTrendCollection(): void {
    setInterval(async () => {
      try {
        await this.collectTrendingTopics();
      } catch (error) {
        logger.error('❌ Error collecting trends:', error);
      }
    }, 60000); // Every minute
  }

  private startEngagementCollection(): void {
    setInterval(async () => {
      try {
        await this.collectEngagementData();
      } catch (error) {
        logger.error('❌ Error collecting engagement data:', error);
      }
    }, 120000); // Every 2 minutes
  }

  private async collectRecentPosts(): Promise<void> {
    try {
      // In a real implementation, this would call the actual Truth Social API
      // For now, we'll generate mock data for development
      const mockPosts = this.generateMockPosts();
      
      for (const post of mockPosts) {
        this.emit('newPost', post);
      }
      
      logger.debug(`📝 Collected ${mockPosts.length} new posts`);
      
    } catch (error) {
      logger.error('❌ Error collecting recent posts:', error);
    }
  }

  private async collectTrendingTopics(): Promise<void> {
    try {
      // Mock trending topics for development
      const mockTrends = this.generateMockTrends();
      
      for (const trend of mockTrends) {
        this.emit('trend', trend);
      }
      
      logger.debug(`📈 Collected ${mockTrends.length} trending topics`);
      
    } catch (error) {
      logger.error('❌ Error collecting trending topics:', error);
    }
  }

  private async collectEngagementData(): Promise<void> {
    try {
      // Mock engagement data for development
      const mockEngagement = this.generateMockEngagement();
      
      for (const engagement of mockEngagement) {
        this.emit('engagement', engagement);
      }
      
      logger.debug(`👥 Collected ${mockEngagement.length} engagement updates`);
      
    } catch (error) {
      logger.error('❌ Error collecting engagement data:', error);
    }
  }

  // Mock data generators for development
  private generateMockPosts(): TruthSocialPost[] {
    const mockPosts: TruthSocialPost[] = [];
    const sampleContent = [
      "America First policies are working! #MAGA",
      "The mainstream media won't report the truth about our economy",
      "Thank you to all the patriots supporting our movement",
      "We need to secure our borders and protect American jobs",
      "The deep state is trying to undermine our democracy"
    ];

    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
      mockPosts.push({
        id: `mock_${Date.now()}_${i}`,
        content: sampleContent[Math.floor(Math.random() * sampleContent.length)],
        author: {
          id: 'realDonaldTrump',
          username: 'realDonaldTrump',
          displayName: 'Donald J. Trump',
          verified: true,
          followerCount: 4500000,
          followingCount: 50,
          postCount: 15000,
          joinDate: new Date('2022-02-21')
        },
        timestamp: new Date(),
        engagement: {
          likes: Math.floor(Math.random() * 50000) + 1000,
          reposts: Math.floor(Math.random() * 10000) + 100,
          comments: Math.floor(Math.random() * 5000) + 50,
          shares: Math.floor(Math.random() * 2000) + 10,
          views: Math.floor(Math.random() * 500000) + 10000,
          impressions: Math.floor(Math.random() * 1000000) + 50000,
          engagementRate: Math.random() * 0.1 + 0.02,
          reachEstimate: Math.floor(Math.random() * 2000000) + 100000
        },
        hashtags: ['#MAGA', '#AmericaFirst', '#TruthSocial'],
        mentions: [],
        verified: true
      });
    }

    return mockPosts;
  }

  private generateMockTrends(): any[] {
    const trendingTopics = [
      '#MAGA',
      '#AmericaFirst',
      '#TruthSocial',
      '#Election2024',
      '#DeepState',
      '#MainstreamMedia',
      '#Patriots'
    ];

    return trendingTopics.map(topic => ({
      topic,
      volume: Math.floor(Math.random() * 10000) + 1000,
      growth: Math.random() * 200 - 100, // -100% to +100%
      timestamp: new Date()
    }));
  }

  private generateMockEngagement(): any[] {
    const engagementUpdates = [];
    
    for (let i = 0; i < Math.floor(Math.random() * 10) + 1; i++) {
      engagementUpdates.push({
        postId: `mock_post_${Math.floor(Math.random() * 1000)}`,
        type: ['like', 'repost', 'comment', 'share'][Math.floor(Math.random() * 4)],
        userId: `user_${Math.floor(Math.random() * 10000)}`,
        timestamp: new Date()
      });
    }

    return engagementUpdates;
  }

  // Public API methods
  public async getPost(postId: string): Promise<TruthSocialPost | null> {
    try {
      const response = await this.apiClient.get(`/statuses/${postId}`);
      return this.transformPost(response.data);
    } catch (error) {
      logger.error(`❌ Error fetching post ${postId}:`, error);
      return null;
    }
  }

  public async getUser(userId: string): Promise<TruthSocialUser | null> {
    try {
      const response = await this.apiClient.get(`/accounts/${userId}`);
      return this.transformUser(response.data);
    } catch (error) {
      logger.error(`❌ Error fetching user ${userId}:`, error);
      return null;
    }
  }

  public async searchPosts(query: string, limit: number = 20): Promise<TruthSocialPost[]> {
    try {
      const response = await this.apiClient.get('/search', {
        params: { q: query, type: 'statuses', limit }
      });
      return response.data.statuses.map(this.transformPost);
    } catch (error) {
      logger.error(`❌ Error searching posts for "${query}":`, error);
      return [];
    }
  }

  private transformPost(rawPost: any): TruthSocialPost {
    // Transform raw API response to our TruthSocialPost interface
    return {
      id: rawPost.id,
      content: rawPost.content,
      author: this.transformUser(rawPost.account),
      timestamp: new Date(rawPost.created_at),
      engagement: {
        likes: rawPost.favourites_count || 0,
        reposts: rawPost.reblogs_count || 0,
        comments: rawPost.replies_count || 0,
        shares: 0, // Not available in standard API
        views: 0, // Not available in standard API
        impressions: 0, // Not available in standard API
        engagementRate: 0, // Calculated separately
        reachEstimate: 0 // Calculated separately
      },
      hashtags: this.extractHashtags(rawPost.content),
      mentions: this.extractMentions(rawPost.content),
      verified: rawPost.account?.verified || false
    };
  }

  private transformUser(rawUser: any): TruthSocialUser {
    return {
      id: rawUser.id,
      username: rawUser.username,
      displayName: rawUser.display_name,
      bio: rawUser.note,
      verified: rawUser.verified || false,
      followerCount: rawUser.followers_count || 0,
      followingCount: rawUser.following_count || 0,
      postCount: rawUser.statuses_count || 0,
      joinDate: new Date(rawUser.created_at),
      profileImage: rawUser.avatar,
      bannerImage: rawUser.header
    };
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[\w]+/g;
    return content.match(hashtagRegex) || [];
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@[\w]+/g;
    return content.match(mentionRegex) || [];
  }
}

