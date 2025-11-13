/**
 * Facebook Service - Comprehensive Facebook Graph API Integration
 * Provides social media capabilities, user authentication, and data synchronization
 * Integrates with the bridge service for cross-app communication
 */

import bridgeService from './bridgeService';
import sharedDataService from './sharedDataService';

// Facebook Graph API Types
interface FacebookUser {
    id: string;
    name: string;
    email?: string;
    picture?: {
        data: {
            url: string;
        };
    };
    first_name?: string;
    last_name?: string;
}

interface FacebookPost {
    id: string;
    message?: string;
    story?: string;
    created_time: string;
    updated_time?: string;
    likes?: {
        data: any[];
        summary: {
            total_count: number;
        };
    };
    comments?: {
        data: any[];
        summary: {
            total_count: number;
        };
    };
    shares?: {
        count: number;
    };
}

interface FacebookPage {
    id: string;
    name: string;
    category: string;
    access_token?: string;
    fan_count?: number;
    talking_about_count?: number;
}

interface FacebookInsights {
    name: string;
    period: string;
    values: Array<{
        value: number;
        end_time: string;
    }>;
    title: string;
    description: string;
}

interface FacebookConfig {
    appId: string;
    appSecret: string;
    accessToken?: string;
    pageAccessToken?: string;
    apiVersion: string;
    permissions: string[];
}

interface SocialMediaPost {
    id: string;
    platform: 'facebook';
    content: string;
    mediaUrls?: string[];
    scheduledTime?: number;
    publishedTime?: number;
    status: 'draft' | 'scheduled' | 'published' | 'failed';
    engagement: {
        likes: number;
        comments: number;
        shares: number;
        reach?: number;
    };
    targetAudience?: {
        demographics?: string[];
        interests?: string[];
        locations?: string[];
    };
}

interface FacebookAnalytics {
    pageInsights: {
        pageViews: number;
        pageEngagement: number;
        pageFans: number;
        pageImpressions: number;
        reach: number;
    };
    postPerformance: {
        totalPosts: number;
        averageLikes: number;
        averageComments: number;
        averageShares: number;
        topPerformingPost?: FacebookPost;
    };
    audienceInsights: {
        demographics: {
            ageGroups: Record<string, number>;
            genders: Record<string, number>;
            locations: Record<string, number>;
        };
        interests: string[];
        onlineHours: Record<string, number>;
    };
    trends: {
        engagementTrend: Array<{ date: string; value: number }>;
        followerGrowth: Array<{ date: string; value: number }>;
        reachTrend: Array<{ date: string; value: number }>;
    };
}

class FacebookService {
    private config: FacebookConfig;
    private baseUrl: string;
    private isInitialized: boolean = false;

    constructor() {
        this.config = {
            appId: process.env.FACEBOOK_APP_ID || '',
            appSecret: process.env.FACEBOOK_APP_SECRET || '',
            accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
            pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '',
            apiVersion: 'v18.0',
            permissions: [
                'public_profile',
                'email',
                'pages_read_engagement',
                'pages_manage_posts',
                'pages_show_list',
                'read_insights',
                'publish_to_groups'
            ]
        };
        this.baseUrl = `https://graph.facebook.com/${this.config.apiVersion}`;
        this.initialize();
    }

    /**
     * Initialize Facebook service and register with bridge
     */
    async initialize(): Promise<void> {
        try {
            // Register with bridge service
            bridgeService.registerApp({
                appName: 'FacebookService',
                capabilities: [
                    'social_media_posting',
                    'user_authentication',
                    'analytics_tracking',
                    'content_management',
                    'audience_insights'
                ],
                dataTypes: [
                    'facebook_posts',
                    'facebook_users',
                    'facebook_analytics',
                    'social_media_content'
                ],
                eventTypes: [
                    'facebook_post_published',
                    'facebook_user_authenticated',
                    'facebook_analytics_updated',
                    'facebook_engagement_received'
                ]
            });

            // Load saved configuration
            await this.loadConfiguration();

            // Set up event listeners
            this.setupEventListeners();

            this.isInitialized = true;

            // Publish initialization event
            bridgeService.publish({
                type: 'facebook_service_initialized',
                source: 'FacebookService',
                data: { 
                    status: 'ready',
                    capabilities: ['posting', 'analytics', 'authentication'],
                    apiVersion: this.config.apiVersion
                }
            });

            console.log('Facebook Service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Facebook Service:', error);
            throw error;
        }
    }

    /**
     * Load configuration from shared data
     */
    private async loadConfiguration(): Promise<void> {
        try {
            const savedConfig = await sharedDataService.getSharedData('facebook_config');
            if (savedConfig) {
                this.config = { ...this.config, ...savedConfig };
            }
        } catch (error) {
            console.warn('No saved Facebook configuration found, using defaults');
        }
    }

    /**
     * Save configuration to shared data
     */
    async saveConfiguration(config: Partial<FacebookConfig>): Promise<void> {
        this.config = { ...this.config, ...config };
        await sharedDataService.setSharedData('facebook_config', this.config, ['FacebookService'], ['FacebookService']);
        
        bridgeService.publish({
            type: 'facebook_config_updated',
            source: 'FacebookService',
            data: { configKeys: Object.keys(config) }
        });
    }

    /**
     * Set up event listeners for bridge communication
     */
    private setupEventListeners(): void {
        // Listen for post requests from other apps
        bridgeService.subscribe('social_media_post_request', async (event) => {
            if (event.data.platform === 'facebook') {
                await this.createPost(event.data.content, event.data.options);
            }
        });

        // Listen for analytics requests
        bridgeService.subscribe('facebook_analytics_request', async (event) => {
            const analytics = await this.getAnalytics(event.data.timeframe);
            bridgeService.publish({
                type: 'facebook_analytics_response',
                source: 'FacebookService',
                data: { requestId: event.data.requestId, analytics }
            });
        });

        // Listen for user authentication requests
        bridgeService.subscribe('facebook_auth_request', async (event) => {
            const authUrl = this.generateAuthUrl(event.data.redirectUri);
            bridgeService.publish({
                type: 'facebook_auth_url_generated',
                source: 'FacebookService',
                data: { requestId: event.data.requestId, authUrl }
            });
        });
    }

    /**
     * Generate Facebook OAuth URL
     */
    generateAuthUrl(redirectUri: string, state?: string): string {
        const params = new URLSearchParams({
            client_id: this.config.appId,
            redirect_uri: redirectUri,
            scope: this.config.permissions.join(','),
            response_type: 'code',
            state: state || 'facebook_auth'
        });

        return `https://www.facebook.com/v${this.config.apiVersion}/dialog/oauth?${params.toString()}`;
    }

    /**
     * Exchange authorization code for access token
     */
    async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
        const params = new URLSearchParams({
            client_id: this.config.appId,
            client_secret: this.config.appSecret,
            redirect_uri: redirectUri,
            code: code
        });

        const response = await fetch(`${this.baseUrl}/oauth/access_token?${params.toString()}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(`Facebook OAuth error: ${data.error.message}`);
        }

        this.config.accessToken = data.access_token;
        await this.saveConfiguration({ accessToken: data.access_token });

        bridgeService.publish({
            type: 'facebook_user_authenticated',
            source: 'FacebookService',
            data: { accessToken: data.access_token }
        });

        return data.access_token;
    }

    /**
     * Get current user information
     */
    async getCurrentUser(): Promise<FacebookUser> {
        if (!this.config.accessToken) {
            throw new Error('No access token available. Please authenticate first.');
        }

        const response = await fetch(
            `${this.baseUrl}/me?fields=id,name,email,picture,first_name,last_name&access_token=${this.config.accessToken}`
        );
        const user = await response.json();

        if (user.error) {
            throw new Error(`Facebook API error: ${user.error.message}`);
        }

        // Save user to shared data
        await sharedDataService.setSharedData('facebook_current_user', user, ['FacebookService'], ['FacebookService']);

        return user;
    }

    /**
     * Get user's Facebook pages
     */
    async getUserPages(): Promise<FacebookPage[]> {
        if (!this.config.accessToken) {
            throw new Error('No access token available. Please authenticate first.');
        }

        const response = await fetch(
            `${this.baseUrl}/me/accounts?access_token=${this.config.accessToken}`
        );
        const data = await response.json();

        if (data.error) {
            throw new Error(`Facebook API error: ${data.error.message}`);
        }

        const pages = data.data || [];
        
        // Save pages to shared data
        await sharedDataService.setSharedData('facebook_user_pages', pages, ['FacebookService'], ['FacebookService']);

        return pages;
    }

    /**
     * Create a Facebook post
     */
    async createPost(
        message: string, 
        options: {
            pageId?: string;
            link?: string;
            imageUrl?: string;
            scheduledTime?: number;
            targetAudience?: any;
        } = {}
    ): Promise<SocialMediaPost> {
        const accessToken = options.pageId ? 
            await this.getPageAccessToken(options.pageId) : 
            this.config.accessToken;

        if (!accessToken) {
            throw new Error('No access token available for posting');
        }

        const endpoint = options.pageId ? 
            `${this.baseUrl}/${options.pageId}/feed` : 
            `${this.baseUrl}/me/feed`;

        const postData: any = {
            message: message,
            access_token: accessToken
        };

        if (options.link) {
            postData.link = options.link;
        }

        if (options.scheduledTime) {
            postData.scheduled_publish_time = Math.floor(options.scheduledTime / 1000);
            postData.published = false;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });

        const result = await response.json();

        if (result.error) {
            throw new Error(`Facebook posting error: ${result.error.message}`);
        }

        const socialPost: SocialMediaPost = {
            id: result.id,
            platform: 'facebook',
            content: message,
            mediaUrls: options.imageUrl ? [options.imageUrl] : undefined,
            scheduledTime: options.scheduledTime,
            publishedTime: options.scheduledTime ? undefined : Date.now(),
            status: options.scheduledTime ? 'scheduled' : 'published',
            engagement: {
                likes: 0,
                comments: 0,
                shares: 0
            },
            targetAudience: options.targetAudience
        };

        // Save post to shared data
        const existingPosts = await sharedDataService.getSharedData('facebook_posts') || [];
        existingPosts.push(socialPost);
        await sharedDataService.setSharedData('facebook_posts', existingPosts, ['FacebookService'], ['FacebookService', 'Dashboard']);

        // Publish event
        bridgeService.publish({
            type: 'facebook_post_published',
            source: 'FacebookService',
            data: { 
                postId: result.id,
                message: message,
                status: socialPost.status,
                pageId: options.pageId
            }
        });

        return socialPost;
    }

    /**
     * Get page access token
     */
    private async getPageAccessToken(pageId: string): Promise<string> {
        const pages = await this.getUserPages();
        const page = pages.find(p => p.id === pageId);
        
        if (!page || !page.access_token) {
            throw new Error(`No access token found for page ${pageId}`);
        }

        return page.access_token;
    }

    /**
     * Get post insights and engagement
     */
    async getPostEngagement(postId: string): Promise<any> {
        if (!this.config.accessToken) {
            throw new Error('No access token available');
        }

        const response = await fetch(
            `${this.baseUrl}/${postId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${this.config.accessToken}`
        );
        const data = await response.json();

        if (data.error) {
            throw new Error(`Facebook API error: ${data.error.message}`);
        }

        return {
            likes: data.likes?.summary?.total_count || 0,
            comments: data.comments?.summary?.total_count || 0,
            shares: data.shares?.count || 0
        };
    }

    /**
     * Get comprehensive analytics
     */
    async getAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<FacebookAnalytics> {
        if (!this.config.accessToken) {
            throw new Error('No access token available');
        }

        try {
            // Get page insights (if page access token is available)
            const pages = await this.getUserPages();
            let pageInsights = {
                pageViews: 0,
                pageEngagement: 0,
                pageFans: 0,
                pageImpressions: 0,
                reach: 0
            };

            if (pages.length > 0 && pages[0].access_token) {
                const insightsResponse = await fetch(
                    `${this.baseUrl}/${pages[0].id}/insights?metric=page_views_total,page_engaged_users,page_fans,page_impressions,page_reach&period=${timeframe}&access_token=${pages[0].access_token}`
                );
                const insightsData = await insightsResponse.json();
                
                if (!insightsData.error && insightsData.data) {
                    insightsData.data.forEach((metric: FacebookInsights) => {
                        const latestValue = metric.values[metric.values.length - 1]?.value || 0;
                        switch (metric.name) {
                            case 'page_views_total':
                                pageInsights.pageViews = latestValue;
                                break;
                            case 'page_engaged_users':
                                pageInsights.pageEngagement = latestValue;
                                break;
                            case 'page_fans':
                                pageInsights.pageFans = latestValue;
                                break;
                            case 'page_impressions':
                                pageInsights.pageImpressions = latestValue;
                                break;
                            case 'page_reach':
                                pageInsights.reach = latestValue;
                                break;
                        }
                    });
                }
            }

            // Get recent posts for performance analysis
            const posts = await sharedDataService.getSharedData('facebook_posts') || [];
            const recentPosts = posts.filter((post: SocialMediaPost) => 
                Date.now() - (post.publishedTime || 0) < 30 * 24 * 60 * 60 * 1000 // Last 30 days
            );

            const postPerformance = {
                totalPosts: recentPosts.length,
                averageLikes: recentPosts.reduce((sum: number, post: SocialMediaPost) => sum + post.engagement.likes, 0) / recentPosts.length || 0,
                averageComments: recentPosts.reduce((sum: number, post: SocialMediaPost) => sum + post.engagement.comments, 0) / recentPosts.length || 0,
                averageShares: recentPosts.reduce((sum: number, post: SocialMediaPost) => sum + post.engagement.shares, 0) / recentPosts.length || 0,
                topPerformingPost: recentPosts.sort((a: SocialMediaPost, b: SocialMediaPost) => 
                    (b.engagement.likes + b.engagement.comments + b.engagement.shares) - 
                    (a.engagement.likes + a.engagement.comments + a.engagement.shares)
                )[0]
            };

            // Mock audience insights (would require additional API calls in production)
            const audienceInsights = {
                demographics: {
                    ageGroups: { '18-24': 25, '25-34': 35, '35-44': 20, '45-54': 15, '55+': 5 },
                    genders: { 'male': 45, 'female': 55 },
                    locations: { 'US': 60, 'CA': 15, 'UK': 10, 'AU': 8, 'Other': 7 }
                },
                interests: ['Technology', 'AI', 'Social Media', 'Business', 'Innovation'],
                onlineHours: { '9': 10, '12': 15, '15': 20, '18': 25, '21': 30 }
            };

            // Generate trend data
            const trends = {
                engagementTrend: this.generateTrendData(30, 100, 500),
                followerGrowth: this.generateTrendData(30, pageInsights.pageFans - 100, pageInsights.pageFans),
                reachTrend: this.generateTrendData(30, 1000, 5000)
            };

            const analytics: FacebookAnalytics = {
                pageInsights,
                postPerformance,
                audienceInsights,
                trends
            };

            // Save analytics to shared data
            await sharedDataService.setSharedData('facebook_analytics', analytics, ['FacebookService'], ['FacebookService', 'Dashboard', 'SystemAnatomy']);

            // Publish analytics update event
            bridgeService.publish({
                type: 'facebook_analytics_updated',
                source: 'FacebookService',
                data: { 
                    timeframe,
                    totalPosts: postPerformance.totalPosts,
                    totalEngagement: pageInsights.pageEngagement,
                    reach: pageInsights.reach
                }
            });

            return analytics;
        } catch (error) {
            console.error('Error fetching Facebook analytics:', error);
            throw error;
        }
    }

    /**
     * Generate trend data for analytics
     */
    private generateTrendData(days: number, minValue: number, maxValue: number): Array<{ date: string; value: number }> {
        const data = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const value = Math.floor(Math.random() * (maxValue - minValue) + minValue);
            data.push({
                date: date.toISOString().split('T')[0],
                value
            });
        }
        
        return data;
    }

    /**
     * Schedule a post for later publishing
     */
    async schedulePost(
        message: string,
        scheduledTime: number,
        options: {
            pageId?: string;
            link?: string;
            imageUrl?: string;
        } = {}
    ): Promise<SocialMediaPost> {
        return this.createPost(message, { ...options, scheduledTime });
    }

    /**
     * Get scheduled posts
     */
    async getScheduledPosts(): Promise<SocialMediaPost[]> {
        const posts = await sharedDataService.getSharedData('facebook_posts') || [];
        return posts.filter((post: SocialMediaPost) => post.status === 'scheduled');
    }

    /**
     * Cancel a scheduled post
     */
    async cancelScheduledPost(postId: string): Promise<void> {
        const posts = await sharedDataService.getSharedData('facebook_posts') || [];
        const updatedPosts = posts.map((post: SocialMediaPost) => 
            post.id === postId ? { ...post, status: 'cancelled' as const } : post
        );
        
        await sharedDataService.setSharedData('facebook_posts', updatedPosts, ['FacebookService'], ['FacebookService']);
        
        bridgeService.publish({
            type: 'facebook_post_cancelled',
            source: 'FacebookService',
            data: { postId }
        });
    }

    /**
     * Get service health status
     */
    getHealthStatus(): any {
        return {
            isInitialized: this.isInitialized,
            hasAccessToken: !!this.config.accessToken,
            hasPageToken: !!this.config.pageAccessToken,
            apiVersion: this.config.apiVersion,
            lastActivity: Date.now()
        };
    }

    /**
     * Test API connection
     */
    async testConnection(): Promise<boolean> {
        try {
            if (!this.config.accessToken) {
                return false;
            }
            
            const response = await fetch(`${this.baseUrl}/me?access_token=${this.config.accessToken}`);
            const data = await response.json();
            
            return !data.error;
        } catch (error) {
            return false;
        }
    }
}

// Create and export singleton instance
const facebookService = new FacebookService();
export default facebookService;

