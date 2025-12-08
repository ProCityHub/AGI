// Core Truth Social Types
export interface TruthSocialPost {
  id: string;
  content: string;
  author: TruthSocialUser;
  timestamp: Date;
  engagement: EngagementMetrics;
  media?: MediaAttachment[];
  hashtags: string[];
  mentions: string[];
  reposted?: boolean;
  originalPost?: string;
  location?: string;
  verified: boolean;
}

export interface TruthSocialUser {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  verified: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
  joinDate: Date;
  profileImage?: string;
  bannerImage?: string;
  location?: string;
  website?: string;
}

export interface EngagementMetrics {
  likes: number;
  reposts: number;
  comments: number;
  shares: number;
  views: number;
  impressions: number;
  engagementRate: number;
  reachEstimate: number;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  duration?: number; // for video/audio
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

// Analysis Types
export interface SentimentAnalysis {
  compound: number; // Overall sentiment score (-1 to 1)
  positive: number;
  negative: number;
  neutral: number;
  confidence: number;
  emotions?: EmotionAnalysis;
}

export interface EmotionAnalysis {
  joy: number;
  anger: number;
  fear: number;
  sadness: number;
  surprise: number;
  disgust: number;
  trust: number;
  anticipation: number;
}

export interface AnalysisResult {
  postId: string;
  sentiment: SentimentAnalysis;
  topics: string[];
  entities: NamedEntity[];
  keywords: string[];
  language: string;
  readabilityScore: number;
  politicalLean?: number; // -1 (left) to 1 (right)
  factCheckFlags?: FactCheckFlag[];
  timestamp: Date;
}

export interface NamedEntity {
  text: string;
  type: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'EVENT' | 'POLICY' | 'OTHER';
  confidence: number;
  startIndex: number;
  endIndex: number;
  linkedData?: {
    wikiId?: string;
    description?: string;
  };
}

export interface FactCheckFlag {
  claim: string;
  verdict: 'true' | 'false' | 'mixed' | 'unverified';
  source: string;
  confidence: number;
  explanation: string;
}

// Trend Analysis Types
export interface TrendData {
  topic: string;
  hashtag?: string;
  volume: number;
  growth: number; // percentage growth
  sentiment: SentimentAnalysis;
  timeframe: string;
  peakTime?: Date;
  relatedTopics: string[];
  influencers: TruthSocialUser[];
  viralPotential: number; // 0-1 score
  geographicDistribution?: GeographicData[];
  timestamp: Date;
}

export interface GeographicData {
  region: string;
  country: string;
  state?: string;
  volume: number;
  sentiment: number;
}

// Media Monitoring Types
export interface MediaCoverage {
  id: string;
  source: string;
  title: string;
  content: string;
  url: string;
  author?: string;
  publishDate: Date;
  sentiment: SentimentAnalysis;
  topics: string[];
  mentions: string[];
  credibilityScore: number;
  reachEstimate: number;
  socialShares: number;
  category: 'news' | 'opinion' | 'analysis' | 'editorial' | 'blog';
}

// Political Intelligence Types
export interface PoliticalEvent {
  id: string;
  type: 'speech' | 'rally' | 'interview' | 'statement' | 'policy' | 'campaign' | 'debate';
  title: string;
  description: string;
  date: Date;
  location?: string;
  participants: string[];
  topics: string[];
  significance: 'low' | 'medium' | 'high' | 'critical';
  relatedPosts: string[];
  mediaAttention: number;
  publicReaction: SentimentAnalysis;
}

export interface PolicyPosition {
  id: string;
  topic: string;
  position: string;
  confidence: number;
  sources: string[];
  lastUpdated: Date;
  changes: PolicyChange[];
}

export interface PolicyChange {
  date: Date;
  previousPosition: string;
  newPosition: string;
  reason?: string;
  source: string;
}

// System Types
export interface BridgeMetrics {
  totalPosts: number;
  activeTrends: number;
  sentimentScore: number;
  engagementRate: number;
  lastUpdate: Date;
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  requestId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Configuration Types
export interface BridgeConfig {
  truthSocial: {
    apiKey: string;
    apiSecret: string;
    baseUrl: string;
    rateLimits: {
      requestsPerMinute: number;
      requestsPerHour: number;
    };
  };
  database: {
    mongodb: {
      uri: string;
      database: string;
    };
    redis: {
      host: string;
      port: number;
      password?: string;
    };
  };
  ai: {
    sentimentAnalysis: {
      provider: 'openai' | 'huggingface' | 'local';
      model: string;
      apiKey?: string;
    };
    contentAnalysis: {
      provider: 'openai' | 'huggingface' | 'local';
      model: string;
      apiKey?: string;
    };
  };
  monitoring: {
    mediaSourcesEnabled: boolean;
    factCheckingEnabled: boolean;
    realTimeAlertsEnabled: boolean;
  };
  privacy: {
    dataRetentionDays: number;
    anonymizeUsers: boolean;
    respectPrivacySettings: boolean;
  };
}

// WebSocket Types
export interface SocketEvent {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
}

export interface RealTimeUpdate {
  type: 'post' | 'trend' | 'sentiment' | 'engagement' | 'media' | 'political';
  data: any;
  timestamp: Date;
}

// Search and Filter Types
export interface SearchFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  sentiment?: 'positive' | 'negative' | 'neutral';
  verified?: boolean;
  minEngagement?: number;
  hashtags?: string[];
  mentions?: string[];
  topics?: string[];
  language?: string;
  location?: string;
}

export interface SearchResult {
  posts: TruthSocialPost[];
  aggregations: {
    totalCount: number;
    sentimentDistribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
    topHashtags: Array<{ tag: string; count: number }>;
    topMentions: Array<{ mention: string; count: number }>;
    timeDistribution: Array<{ date: string; count: number }>;
  };
}

// Analytics Types
export interface AnalyticsReport {
  timeframe: string;
  metrics: {
    totalPosts: number;
    totalEngagement: number;
    averageSentiment: number;
    topTrends: TrendData[];
    influentialUsers: TruthSocialUser[];
    viralContent: TruthSocialPost[];
  };
  insights: string[];
  recommendations: string[];
  generatedAt: Date;
}

// Error Types
export interface BridgeError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  service: string;
}

// Export all types
export * from './api';
export * from './database';
export * from './services';

