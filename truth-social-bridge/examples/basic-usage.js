/**
 * Truth Social Bridge - Basic Usage Examples
 * 
 * This file demonstrates basic usage of the Truth Social Bridge API
 * for common operations like fetching posts, analyzing sentiment,
 * and monitoring trends.
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'your_api_key_here'; // If authentication is required

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Request-ID': `example-${Date.now()}`,
    // 'Authorization': `Bearer ${API_KEY}` // Uncomment if auth required
  }
});

/**
 * Example 1: Fetch Recent Truth Social Posts
 */
async function fetchRecentPosts() {
  try {
    console.log('📝 Fetching recent Truth Social posts...');
    
    const response = await api.get('/truth-social/posts', {
      params: {
        limit: 20,
        page: 1
      }
    });
    
    if (response.data.success) {
      const posts = response.data.data.data;
      console.log(`✅ Retrieved ${posts.length} posts`);
      
      // Display first few posts
      posts.slice(0, 3).forEach((post, index) => {
        console.log(`\n--- Post ${index + 1} ---`);
        console.log(`Author: ${post.author.displayName} (@${post.author.username})`);
        console.log(`Content: ${post.content.substring(0, 100)}...`);
        console.log(`Likes: ${post.engagement.likes.toLocaleString()}`);
        console.log(`Reposts: ${post.engagement.reposts.toLocaleString()}`);
        console.log(`Timestamp: ${new Date(post.timestamp).toLocaleString()}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching posts:', error.message);
  }
}

/**
 * Example 2: Get Trending Topics
 */
async function getTrendingTopics() {
  try {
    console.log('\n📈 Fetching trending topics...');
    
    const response = await api.get('/trends/topics', {
      params: {
        limit: 10,
        timeframe: '24h'
      }
    });
    
    if (response.data.success) {
      const trends = response.data.data;
      console.log(`✅ Retrieved ${trends.length} trending topics`);
      
      trends.forEach((trend, index) => {
        console.log(`${index + 1}. ${trend.topic} (${trend.volume.toLocaleString()} mentions, ${trend.growth > 0 ? '+' : ''}${trend.growth.toFixed(1)}% growth)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching trends:', error.message);
  }
}

/**
 * Example 3: Analyze Sentiment for a Specific User
 */
async function analyzeSentimentForUser(userId = 'realDonaldTrump') {
  try {
    console.log(`\n🎭 Analyzing sentiment for user: ${userId}...`);
    
    // First get user's recent posts
    const postsResponse = await api.get(`/truth-social/users/${userId}/posts`, {
      params: { limit: 10 }
    });
    
    if (postsResponse.data.success) {
      const posts = postsResponse.data.data.data;
      
      // Analyze sentiment for each post
      for (const post of posts.slice(0, 3)) {
        const sentimentResponse = await api.get(`/sentiment/analyze/${post.id}`);
        
        if (sentimentResponse.data.success) {
          const analysis = sentimentResponse.data.data;
          console.log(`\nPost: "${post.content.substring(0, 50)}..."`);
          console.log(`Sentiment: ${analysis.sentiment.compound > 0 ? '😊 Positive' : analysis.sentiment.compound < 0 ? '😞 Negative' : '😐 Neutral'} (${analysis.sentiment.compound.toFixed(2)})`);
          console.log(`Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error analyzing sentiment:', error.message);
  }
}

/**
 * Example 4: Search for Posts with Specific Keywords
 */
async function searchPosts(query = '#MAGA') {
  try {
    console.log(`\n🔍 Searching for posts with: "${query}"...`);
    
    const response = await api.get('/search/posts', {
      params: {
        q: query,
        limit: 10,
        sentiment: 'positive', // Filter by sentiment
        verified: true // Only verified users
      }
    });
    
    if (response.data.success) {
      const results = response.data.data;
      console.log(`✅ Found ${results.posts.length} posts`);
      console.log(`📊 Sentiment Distribution:`);
      console.log(`   Positive: ${results.aggregations.sentimentDistribution.positive}`);
      console.log(`   Negative: ${results.aggregations.sentimentDistribution.negative}`);
      console.log(`   Neutral: ${results.aggregations.sentimentDistribution.neutral}`);
      
      // Show top hashtags from results
      console.log(`\n🏷️ Top Hashtags:`);
      results.aggregations.topHashtags.slice(0, 5).forEach((tag, index) => {
        console.log(`   ${index + 1}. ${tag.tag} (${tag.count} posts)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error searching posts:', error.message);
  }
}

/**
 * Example 5: Get Platform Statistics
 */
async function getPlatformStats() {
  try {
    console.log('\n📊 Fetching platform statistics...');
    
    const response = await api.get('/truth-social/stats');
    
    if (response.data.success) {
      const stats = response.data.data;
      console.log('✅ Platform Statistics:');
      console.log(`   Total Posts: ${stats.totalPosts.toLocaleString()}`);
      console.log(`   Active Trends: ${stats.activeTrends}`);
      console.log(`   Average Sentiment: ${stats.averageSentiment.toFixed(2)}`);
      console.log(`   Engagement Rate: ${(stats.engagementRate * 100).toFixed(2)}%`);
      console.log(`   Daily Active Users: ${stats.additionalMetrics.dailyActiveUsers.toLocaleString()}`);
      console.log(`   Posts Per Hour: ${stats.additionalMetrics.postsPerHour.toLocaleString()}`);
      console.log(`   System Health: ${stats.systemHealth}`);
    }
    
  } catch (error) {
    console.error('❌ Error fetching stats:', error.message);
  }
}

/**
 * Example 6: Monitor Real-time Updates via WebSocket
 */
function monitorRealTimeUpdates() {
  console.log('\n🔴 Starting real-time monitoring...');
  
  // Note: This would require socket.io-client in a real implementation
  console.log('📡 WebSocket connection would be established here');
  console.log('🎯 Real-time events would include:');
  console.log('   - New posts from key accounts');
  console.log('   - Trending topic changes');
  console.log('   - Viral content alerts');
  console.log('   - Sentiment shifts');
  console.log('   - Engagement spikes');
  
  // Simulated real-time events
  setTimeout(() => {
    console.log('🚨 ALERT: Viral content detected - Post engagement spike of 500%');
  }, 2000);
  
  setTimeout(() => {
    console.log('📈 TREND: New hashtag #Election2024 trending with 15,000 mentions');
  }, 4000);
  
  setTimeout(() => {
    console.log('🎭 SENTIMENT: Overall platform sentiment shifted from 0.2 to 0.6 (positive)');
  }, 6000);
}

/**
 * Example 7: Generate Analytics Report
 */
async function generateAnalyticsReport() {
  try {
    console.log('\n📋 Generating analytics report...');
    
    const response = await api.get('/analytics/report', {
      params: {
        timeframe: '7d',
        format: 'json',
        includeCharts: false
      }
    });
    
    if (response.data.success) {
      const report = response.data.data;
      console.log('✅ Analytics Report Generated:');
      console.log(`   Timeframe: ${report.timeframe}`);
      console.log(`   Total Posts Analyzed: ${report.metrics.totalPosts.toLocaleString()}`);
      console.log(`   Total Engagement: ${report.metrics.totalEngagement.toLocaleString()}`);
      console.log(`   Average Sentiment: ${report.metrics.averageSentiment.toFixed(2)}`);
      console.log(`   Top Trends: ${report.metrics.topTrends.map(t => t.topic).join(', ')}`);
      console.log(`   Generated: ${new Date(report.generatedAt).toLocaleString()}`);
      
      if (report.insights.length > 0) {
        console.log('\n💡 Key Insights:');
        report.insights.slice(0, 3).forEach((insight, index) => {
          console.log(`   ${index + 1}. ${insight}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error generating report:', error.message);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🇺🇸 Truth Social Bridge - Basic Usage Examples\n');
  console.log('=' .repeat(60));
  
  try {
    // Check if API is available
    const healthCheck = await api.get('/health');
    if (healthCheck.data.status !== 'healthy') {
      throw new Error('API is not healthy');
    }
    
    console.log('✅ API is healthy and ready\n');
    
    // Run examples
    await fetchRecentPosts();
    await getTrendingTopics();
    await analyzeSentimentForUser();
    await searchPosts();
    await getPlatformStats();
    await generateAnalyticsReport();
    
    // Start real-time monitoring (simulated)
    monitorRealTimeUpdates();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 All examples completed successfully!');
    console.log('📚 Check the API documentation for more advanced features.');
    
  } catch (error) {
    console.error('\n❌ Failed to connect to Truth Social Bridge API:', error.message);
    console.log('\n🔧 Make sure the API server is running on http://localhost:3000');
    console.log('💡 Run: npm run dev (in the truth-social-bridge directory)');
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fetchRecentPosts,
  getTrendingTopics,
  analyzeSentimentForUser,
  searchPosts,
  getPlatformStats,
  generateAnalyticsReport,
  monitorRealTimeUpdates
};

