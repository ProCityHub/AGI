# 🇨🇦 Canadian Political Bridge - Usage Examples

This document provides comprehensive examples of how to use the Canadian Political AI Bridge system to access and analyze political data from all Canadian parties and government repositories.

## 🚀 Getting Started

### Basic Setup
```bash
# Start the bridge system
npm run dev

# The API will be available at http://localhost:3000/api/v1
```

## 📊 Political Party Data Examples

### Get All Political Parties
```bash
curl "http://localhost:3000/api/v1/political-parties"
```

```javascript
// Response
{
  "success": true,
  "data": [
    {
      "id": "liberal",
      "name": "Liberal Party of Canada",
      "shortName": "LPC",
      "leader": "Justin Trudeau",
      "founded": 1867,
      "ideology": ["Liberalism", "Social liberalism", "Centrism"],
      "colors": ["#FF0000", "#FFFFFF"],
      "website": "https://liberal.ca",
      "currentSeats": { "house": 158, "senate": 0 },
      "polling": { "current": 32.5, "trend": "up", "lastUpdated": "2024-11-14T04:32:43.000Z" }
    },
    // ... other parties
  ]
}
```

### Get Specific Party Data
```bash
curl "http://localhost:3000/api/v1/political-parties/conservative"
```

### Filter Parties by Ideology
```bash
curl "http://localhost:3000/api/v1/political-parties?ideology=social%20democracy"
```

### Filter Parties by Minimum Seats
```bash
curl "http://localhost:3000/api/v1/political-parties?minSeats=25"
```

## 📈 Polling Data Examples

### Get Latest Polling for All Parties
```bash
curl "http://localhost:3000/api/v1/political-parties/polling/latest"
```

### Get Polling for Specific Party
```bash
curl "http://localhost:3000/api/v1/political-parties/liberal/polling"
```

## 🔍 Search Examples

### Search Across All Sources
```bash
curl "http://localhost:3000/api/v1/search?q=climate%20change"
```

```javascript
// Response
{
  "success": true,
  "data": {
    "query": "climate change",
    "results": [
      {
        "source": "federal_government",
        "results": [...],
        "totalResults": 45
      },
      {
        "source": "political_parties",
        "results": [...],
        "totalResults": 23
      }
    ],
    "totalSources": 4,
    "aggregatedResults": 156
  }
}
```

### Search Federal Government Data
```bash
curl "http://localhost:3000/api/v1/federal/search?q=artificial%20intelligence"
```

### Search Provincial Data
```bash
curl "http://localhost:3000/api/v1/provincial/search?q=healthcare&province=alberta"
```

## 🧠 AI Analysis Examples

### Compare Political Parties
```bash
curl -X POST "http://localhost:3000/api/v1/political-parties/compare" \
  -H "Content-Type: application/json" \
  -d '{
    "parties": ["liberal", "conservative", "ndp"],
    "metrics": ["polling", "seats", "ideology"]
  }'
```

### Political Sentiment Analysis
```bash
curl -X POST "http://localhost:3000/api/v1/analysis/sentiment" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The new healthcare policy will benefit all Canadians",
    "context": "healthcare_policy"
  }'
```

### Policy Alignment Analysis
```bash
curl -X POST "http://localhost:3000/api/v1/analysis/policy-alignment" \
  -H "Content-Type: application/json" \
  -d '{
    "federalPolicy": "carbon_tax",
    "provincialPolicies": ["alberta_carbon_levy", "ontario_cap_trade"],
    "analysisType": "alignment_score"
  }'
```

## 🏛️ Government Data Examples

### Get Federal Government Data
```bash
curl "http://localhost:3000/api/v1/federal"
```

### Get Specific Federal Department Data
```bash
curl "http://localhost:3000/api/v1/federal/departments/health-canada"
```

### Get Provincial Government Data
```bash
curl "http://localhost:3000/api/v1/provincial?province=alberta"
```

### Get All Provincial Data
```bash
curl "http://localhost:3000/api/v1/provincial"
```

## 🗳️ Electoral Data Examples

### Get Electoral Districts
```bash
curl "http://localhost:3000/api/v1/electoral/districts"
```

### Find Representative by Postal Code
```bash
curl "http://localhost:3000/api/v1/electoral/representatives?postalCode=K1A0A6"
```

### Get Electoral Boundaries
```bash
curl "http://localhost:3000/api/v1/electoral/boundaries?province=ontario"
```

## 📊 Advanced Analysis Examples

### Generate Political Landscape Report
```bash
curl "http://localhost:3000/api/v1/analysis/political-landscape"
```

```javascript
// Response
{
  "success": true,
  "data": {
    "overview": {
      "governmentType": "Minority Liberal",
      "totalSeats": 338,
      "majorityThreshold": 170
    },
    "partyStandings": [...],
    "keyIssues": [...],
    "regionalBreakdown": [...],
    "trends": {
      "polling": "Conservative slight lead",
      "sentiment": "Mixed on economic policies",
      "engagement": "High on climate issues"
    }
  }
}
```

### Cross-Party Policy Comparison
```bash
curl -X POST "http://localhost:3000/api/v1/analysis/policy-comparison" \
  -H "Content-Type: application/json" \
  -d '{
    "policy": "healthcare",
    "parties": ["liberal", "conservative", "ndp"],
    "metrics": ["funding", "approach", "timeline"]
  }'
```

### Federal-Provincial Alignment Analysis
```bash
curl -X POST "http://localhost:3000/api/v1/analysis/federal-provincial-alignment" \
  -H "Content-Type: application/json" \
  -d '{
    "policy": "carbon_pricing",
    "provinces": ["alberta", "ontario", "quebec"],
    "timeframe": "2024"
  }'
```

## 📈 Real-time Data Examples

### Get System Status
```bash
curl "http://localhost:3000/api/v1/status"
```

### Get Bridge Connection Status
```bash
curl "http://localhost:3000/api/v1/status/bridges"
```

### Trigger Data Sync
```bash
curl -X POST "http://localhost:3000/api/v1/status/sync"
```

## 🔧 Integration Examples

### Node.js Integration
```javascript
const axios = require('axios');

class CanadianPoliticalBridge {
  constructor(baseUrl = 'http://localhost:3000/api/v1') {
    this.baseUrl = baseUrl;
  }

  async getAllParties() {
    const response = await axios.get(`${this.baseUrl}/political-parties`);
    return response.data;
  }

  async getPartyPolling(party) {
    const response = await axios.get(`${this.baseUrl}/political-parties/${party}/polling`);
    return response.data;
  }

  async searchAllSources(query) {
    const response = await axios.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async compareParties(parties, metrics = ['polling', 'seats']) {
    const response = await axios.post(`${this.baseUrl}/political-parties/compare`, {
      parties,
      metrics
    });
    return response.data;
  }
}

// Usage
const bridge = new CanadianPoliticalBridge();

async function example() {
  // Get all parties
  const parties = await bridge.getAllParties();
  console.log('All parties:', parties.data.length);

  // Get Liberal polling data
  const liberalPolling = await bridge.getPartyPolling('liberal');
  console.log('Liberal polling:', liberalPolling.data);

  // Search for climate change across all sources
  const searchResults = await bridge.searchAllSources('climate change');
  console.log('Search results:', searchResults.data.aggregatedResults);

  // Compare major parties
  const comparison = await bridge.compareParties(['liberal', 'conservative', 'ndp']);
  console.log('Party comparison:', comparison.data);
}

example().catch(console.error);
```

### Python Integration
```python
import requests
import json

class CanadianPoliticalBridge:
    def __init__(self, base_url='http://localhost:3000/api/v1'):
        self.base_url = base_url

    def get_all_parties(self):
        response = requests.get(f'{self.base_url}/political-parties')
        return response.json()

    def get_party_data(self, party):
        response = requests.get(f'{self.base_url}/political-parties/{party}')
        return response.json()

    def search_all_sources(self, query):
        response = requests.get(f'{self.base_url}/search', params={'q': query})
        return response.json()

    def analyze_sentiment(self, text, context=None):
        data = {'text': text}
        if context:
            data['context'] = context
        response = requests.post(f'{self.base_url}/analysis/sentiment', json=data)
        return response.json()

# Usage
bridge = CanadianPoliticalBridge()

# Get all parties
parties = bridge.get_all_parties()
print(f"Total parties: {len(parties['data'])}")

# Get Conservative party data
conservative = bridge.get_party_data('conservative')
print(f"Conservative leader: {conservative['data']['leader']}")

# Search for healthcare policies
search_results = bridge.search_all_sources('healthcare policy')
print(f"Healthcare search results: {search_results['data']['aggregatedResults']}")

# Analyze sentiment of a political statement
sentiment = bridge.analyze_sentiment(
    "The new budget will create jobs and strengthen the economy",
    context="economic_policy"
)
print(f"Sentiment analysis: {sentiment['data']['sentiment']}")
```

## 🔄 Webhook Examples

### Setup Webhook for Real-time Updates
```bash
curl -X POST "http://localhost:3000/api/v1/webhooks" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhook/political-updates",
    "events": ["polling_update", "party_data_change", "federal_policy_update"],
    "secret": "your-webhook-secret"
  }'
```

## 📱 Frontend Integration Examples

### React Component Example
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PoliticalDashboard = () => {
  const [parties, setParties] = useState([]);
  const [polling, setPolling] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partiesRes, pollingRes] = await Promise.all([
          axios.get('http://localhost:3000/api/v1/political-parties'),
          axios.get('http://localhost:3000/api/v1/political-parties/polling/latest')
        ]);
        
        setParties(partiesRes.data.data);
        setPolling(pollingRes.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading Canadian political data...</div>;

  return (
    <div className="political-dashboard">
      <h1>🇨🇦 Canadian Political Landscape</h1>
      
      <div className="parties-grid">
        {parties.map(party => (
          <div key={party.id} className="party-card">
            <h3>{party.name}</h3>
            <p>Leader: {party.leader}</p>
            <p>Seats: {party.currentSeats.house}</p>
            <p>Polling: {party.polling.current}%</p>
            <div className="trend">
              Trend: {party.polling.trend === 'up' ? '📈' : 
                     party.polling.trend === 'down' ? '📉' : '➡️'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoliticalDashboard;
```

This comprehensive bridge system connects all Canadian political parties and government repositories into a unified, AI-powered platform for democratic intelligence and engagement!
