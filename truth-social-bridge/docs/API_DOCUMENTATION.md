# 📚 Truth Social Bridge API Documentation

## Overview

The Truth Social Bridge API provides comprehensive access to Truth Social platform data, AI-powered content analysis, sentiment monitoring, and political intelligence capabilities.

**Base URL**: `http://localhost:3000/api/v1` (development)  
**Production URL**: `https://your-domain.com/api/v1`

## 🔐 Authentication

Currently, the API operates in open mode for development. Production deployments should implement proper authentication.

```javascript
// Future authentication header
headers: {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
}
```

## 📊 Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_123456789"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_123456789"
}
```

## 🏛️ Truth Social Endpoints

### Get Recent Posts

Retrieve recent Truth Social posts with pagination.

**Endpoint**: `GET /truth-social/posts`

**Parameters**:
- `limit` (optional): Number of posts to return (max 100, default 50)
- `page` (optional): Page number for pagination (default 1)

**Example Request**:
```bash
curl "http://localhost:3000/api/v1/truth-social/posts?limit=20&page=1"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "post_123",
        "content": "America First policies are working! #MAGA",
        "author": {
          "id": "realDonaldTrump",
          "username": "realDonaldTrump",
          "displayName": "Donald J. Trump",
          "verified": true,
          "followerCount": 4500000
        },
        "timestamp": "2024-01-15T10:00:00.000Z",
        "engagement": {
          "likes": 25000,
          "reposts": 5000,
          "comments": 1200,
          "views": 500000,
          "engagementRate": 0.067
        },
        "hashtags": ["#MAGA", "#AmericaFirst"],
        "mentions": [],
        "verified": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1000,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Specific Post

Retrieve a specific Truth Social post by ID.

**Endpoint**: `GET /truth-social/posts/:postId`

**Example Request**:
```bash
curl "http://localhost:3000/api/v1/truth-social/posts/post_123"
```

### Get User Profile

Retrieve Truth Social user profile information.

**Endpoint**: `GET /truth-social/users/:userId`

**Example Request**:
```bash
curl "http://localhost:3000/api/v1/truth-social/users/realDonaldTrump"
```

### Get User Posts

Retrieve posts from a specific user.

**Endpoint**: `GET /truth-social/users/:userId/posts`

**Parameters**:
- `limit` (optional): Number of posts to return (default 20)
- `page` (optional): Page number for pagination (default 1)

### Get Platform Statistics

Retrieve overall platform statistics and metrics.

**Endpoint**: `GET /truth-social/stats`

**Example Response**:
```json
{
  "success": true,
  "data": {
    "platform": "Truth Social",
    "totalPosts": 1500000,
    "activeTrends": 25,
    "averageSentiment": 0.35,
    "engagementRate": 0.045,
    "systemHealth": "healthy",
    "additionalMetrics": {
      "dailyActiveUsers": 750000,
      "postsPerHour": 2500,
      "topHashtags": ["#MAGA", "#AmericaFirst", "#TruthSocial"],
      "verifiedUsers": 8500
    }
  }
}
```

### Get Trending Hashtags

Retrieve currently trending hashtags.

**Endpoint**: `GET /truth-social/hashtags/trending`

**Parameters**:
- `limit` (optional): Number of hashtags to return (default 10)

## 📈 Trends Endpoints

### Get Trending Topics

Retrieve trending topics and hashtags with growth metrics.

**Endpoint**: `GET /trends/topics`

**Parameters**:
- `limit` (optional): Number of trends to return (default 10)
- `timeframe` (optional): Time window for trends ('1h', '6h', '24h', '7d')

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "topic": "#MAGA",
      "volume": 15000,
      "growth": 25.5,
      "sentiment": {
        "compound": 0.45,
        "positive": 0.6,
        "negative": 0.2,
        "neutral": 0.2
      },
      "timeframe": "24h",
      "viralPotential": 0.8,
      "timestamp": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Viral Content

Retrieve content with high viral potential.

**Endpoint**: `GET /trends/viral`

**Parameters**:
- `threshold` (optional): Viral potential threshold (0-1, default 0.7)
- `limit` (optional): Number of posts to return (default 20)

## 🎭 Sentiment Analysis Endpoints

### Analyze Post Sentiment

Get sentiment analysis for a specific post.

**Endpoint**: `GET /sentiment/analyze/:postId`

**Example Response**:
```json
{
  "success": true,
  "data": {
    "postId": "post_123",
    "sentiment": {
      "compound": 0.6,
      "positive": 0.7,
      "negative": 0.1,
      "neutral": 0.2,
      "confidence": 0.85
    },
    "emotions": {
      "joy": 0.6,
      "anger": 0.1,
      "fear": 0.05,
      "sadness": 0.05,
      "surprise": 0.1,
      "trust": 0.5
    },
    "topics": ["politics", "economy", "policy"],
    "entities": [
      {
        "text": "America",
        "type": "LOCATION",
        "confidence": 0.95
      }
    ],
    "timestamp": "2024-01-15T10:00:00.000Z"
  }
}
```

### Get Aggregated Sentiment

Get aggregated sentiment analysis over a time period.

**Endpoint**: `GET /sentiment/aggregate`

**Parameters**:
- `timeframe` (optional): Time window ('1h', '6h', '24h', '7d', '30d')
- `userId` (optional): Filter by specific user
- `hashtag` (optional): Filter by hashtag

## 🔍 Search Endpoints

### Search Posts

Search for posts using various filters and criteria.

**Endpoint**: `GET /search/posts`

**Parameters**:
- `q` (required): Search query
- `limit` (optional): Number of results (default 20)
- `page` (optional): Page number (default 1)
- `sentiment` (optional): Filter by sentiment ('positive', 'negative', 'neutral')
- `verified` (optional): Filter by verified users (true/false)
- `dateFrom` (optional): Start date (ISO 8601)
- `dateTo` (optional): End date (ISO 8601)
- `minEngagement` (optional): Minimum engagement threshold

**Example Request**:
```bash
curl "http://localhost:3000/api/v1/search/posts?q=%23MAGA&sentiment=positive&verified=true&limit=10"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "posts": [/* array of posts */],
    "aggregations": {
      "totalCount": 5000,
      "sentimentDistribution": {
        "positive": 3000,
        "negative": 1000,
        "neutral": 1000
      },
      "topHashtags": [
        {"tag": "#MAGA", "count": 2500},
        {"tag": "#AmericaFirst", "count": 1800}
      ],
      "topMentions": [
        {"mention": "@realDonaldTrump", "count": 1200}
      ],
      "timeDistribution": [
        {"date": "2024-01-15", "count": 500}
      ]
    }
  }
}
```

### Search Users

Search for Truth Social users.

**Endpoint**: `GET /search/users`

**Parameters**:
- `q` (required): Search query
- `verified` (optional): Filter by verification status
- `minFollowers` (optional): Minimum follower count

## 📰 Media Monitoring Endpoints

### Get Media Coverage

Retrieve media coverage and news articles related to Truth Social content.

**Endpoint**: `GET /media/coverage`

**Parameters**:
- `timeframe` (optional): Time window (default '24h')
- `source` (optional): Filter by media source
- `sentiment` (optional): Filter by sentiment

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "coverage_123",
      "source": "Fox News",
      "title": "Truth Social Engagement Reaches New Heights",
      "url": "https://example.com/article",
      "publishDate": "2024-01-15T09:00:00.000Z",
      "sentiment": {
        "compound": 0.4,
        "positive": 0.6,
        "negative": 0.2,
        "neutral": 0.2
      },
      "topics": ["social media", "politics"],
      "credibilityScore": 0.8,
      "reachEstimate": 500000
    }
  ]
}
```

## 🏛️ Political Intelligence Endpoints

### Get Political Events

Retrieve political events and their impact on Truth Social engagement.

**Endpoint**: `GET /political/events`

**Parameters**:
- `timeframe` (optional): Time window
- `significance` (optional): Filter by significance level
- `type` (optional): Event type filter

### Get Policy Positions

Retrieve tracked policy positions and changes.

**Endpoint**: `GET /political/positions`

**Parameters**:
- `topic` (optional): Filter by policy topic
- `dateFrom` (optional): Start date for position tracking

## 📊 Analytics Endpoints

### Generate Report

Generate comprehensive analytics reports.

**Endpoint**: `GET /analytics/report`

**Parameters**:
- `timeframe` (required): Report time window ('24h', '7d', '30d')
- `format` (optional): Output format ('json', 'csv', 'pdf')
- `includeCharts` (optional): Include chart data (true/false)

**Example Response**:
```json
{
  "success": true,
  "data": {
    "timeframe": "7d",
    "metrics": {
      "totalPosts": 50000,
      "totalEngagement": 2500000,
      "averageSentiment": 0.35,
      "topTrends": [
        {
          "topic": "#MAGA",
          "volume": 15000,
          "growth": 25.5
        }
      ],
      "influentialUsers": [
        {
          "username": "realDonaldTrump",
          "influence": 0.95,
          "reach": 4500000
        }
      ]
    },
    "insights": [
      "Positive sentiment increased by 15% this week",
      "Political content engagement up 30%"
    ],
    "recommendations": [
      "Monitor trending hashtag #Election2024",
      "Increase analysis frequency during peak hours"
    ],
    "generatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Get Real-time Metrics

Retrieve current system metrics and performance data.

**Endpoint**: `GET /analytics/metrics`

## 🔔 Webhook Endpoints

### Register Webhook

Register a webhook for real-time notifications.

**Endpoint**: `POST /webhooks/register`

**Request Body**:
```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["new_post", "viral_content", "sentiment_shift"],
  "secret": "your_webhook_secret"
}
```

### List Webhooks

Get registered webhooks.

**Endpoint**: `GET /webhooks`

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service temporarily down |

## 📝 Rate Limiting

- **Default Limit**: 100 requests per 15 minutes per IP
- **Authenticated Limit**: 1000 requests per 15 minutes per API key
- **Headers**: Rate limit information is included in response headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## 🔧 SDKs and Libraries

### JavaScript/Node.js

```javascript
const TruthSocialBridge = require('truth-social-bridge-sdk');

const client = new TruthSocialBridge({
  baseURL: 'http://localhost:3000/api/v1',
  apiKey: 'your_api_key'
});

// Get recent posts
const posts = await client.posts.getRecent({ limit: 20 });

// Analyze sentiment
const sentiment = await client.sentiment.analyze('post_123');

// Search posts
const results = await client.search.posts('#MAGA', { verified: true });
```

### Python

```python
from truth_social_bridge import TruthSocialBridge

client = TruthSocialBridge(
    base_url='http://localhost:3000/api/v1',
    api_key='your_api_key'
)

# Get recent posts
posts = client.posts.get_recent(limit=20)

# Analyze sentiment
sentiment = client.sentiment.analyze('post_123')

# Search posts
results = client.search.posts('#MAGA', verified=True)
```

## 📞 Support

- **Documentation**: [GitHub Repository](https://github.com/ProCityHub/AGI/tree/main/truth-social-bridge)
- **Issues**: [GitHub Issues](https://github.com/ProCityHub/AGI/issues)
- **API Status**: [Status Page](https://status.yourdomain.com)

## 📄 License

This API documentation is part of the Truth Social Bridge project, licensed under the MIT License.

