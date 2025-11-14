# 🚀 Canadian Political Bridge - Deployment Guide

This guide covers deploying the Canadian Political AI Bridge system to connect all Canadian political parties and government repositories.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                    │
├─────────────────────────────────────────────────────────────┤
│  Load Balancer → API Gateway → Bridge Services → Databases │
│       ↓               ↓              ↓            ↓        │
│   Nginx/HAProxy   Express.js    Bridge Modules   MongoDB   │
│                                                   Redis     │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **MongoDB**: 5.0 or higher
- **Redis**: 6.0 or higher
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: Minimum 20GB SSD
- **Network**: Stable internet connection for API access

### Required API Keys
- **Open Government API**: Register at https://open.canada.ca
- **PollsterAudit API**: Contact api@pollsteraudit.ca
- **OpenNorth API**: Register at https://represent.opennorth.ca
- **OpenAI API**: For AI analysis features
- **GitHub Token**: For repository access

## 🐳 Docker Deployment (Recommended)

### 1. Create Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  canadian-political-bridge:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/canadian-political-bridge
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./config/config.json:/app/config/config.json
      - ./logs:/app/logs
    restart: unless-stopped

  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=your-secure-password
      - MONGO_INITDB_DATABASE=canadian-political-bridge
    restart: unless-stopped

  redis:
    image: redis:6.0-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - canadian-political-bridge
    restart: unless-stopped

volumes:
  mongodb_data:
  redis_data:
```

### 2. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY config/ ./config/

# Build the application
RUN npm run build

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
```

### 3. Deploy with Docker Compose

```bash
# Clone the repository
git clone https://github.com/ProCityHub/AGI.git
cd AGI/canadian-political-bridge

# Copy and configure environment
cp config/config.example.json config/config.json
# Edit config.json with your API keys and settings

# Build and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f canadian-political-bridge
```

## ☁️ Cloud Deployment Options

### AWS Deployment

#### Using AWS ECS with Fargate

```yaml
# aws-task-definition.json
{
  "family": "canadian-political-bridge",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "canadian-political-bridge",
      "image": "your-account.dkr.ecr.region.amazonaws.com/canadian-political-bridge:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "MONGODB_URI",
          "value": "mongodb://your-mongodb-cluster"
        }
      ],
      "secrets": [
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:openai-api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/canadian-political-bridge",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Deployment Commands

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com

docker build -t canadian-political-bridge .
docker tag canadian-political-bridge:latest your-account.dkr.ecr.us-east-1.amazonaws.com/canadian-political-bridge:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/canadian-political-bridge:latest

# Register task definition
aws ecs register-task-definition --cli-input-json file://aws-task-definition.json

# Create or update service
aws ecs create-service \
  --cluster canadian-political-cluster \
  --service-name canadian-political-bridge \
  --task-definition canadian-political-bridge:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-abcdef],assignPublicIp=ENABLED}"
```

### Google Cloud Platform Deployment

#### Using Cloud Run

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/canadian-political-bridge', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/canadian-political-bridge']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'canadian-political-bridge'
      - '--image'
      - 'gcr.io/$PROJECT_ID/canadian-political-bridge'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--memory'
      - '2Gi'
      - '--cpu'
      - '2'
      - '--max-instances'
      - '10'
```

```bash
# Deploy to Cloud Run
gcloud builds submit --config cloudbuild.yaml
```

### Azure Deployment

#### Using Azure Container Instances

```bash
# Create resource group
az group create --name canadian-political-bridge --location eastus

# Create container instance
az container create \
  --resource-group canadian-political-bridge \
  --name canadian-political-bridge \
  --image your-registry.azurecr.io/canadian-political-bridge:latest \
  --cpu 2 \
  --memory 4 \
  --ports 3000 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables OPENAI_API_KEY=your-key \
  --dns-name-label canadian-political-bridge
```

## 🔒 Security Configuration

### 1. Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://[username]:[password]@[host]:[port]/[database]
REDIS_URL=redis://[username]:[password]@[host]:[port]

# API Keys (use secrets management in production)
OPENAI_API_KEY=your-openai-key
POLLSTER_AUDIT_API_KEY=your-pollster-key
OPEN_GOVERNMENT_API_KEY=your-gov-key

# Security
JWT_SECRET=your-very-secure-jwt-secret
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=https://your-frontend.com,https://your-app.com
```

### 2. Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream canadian_political_bridge {
        server canadian-political-bridge:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Rate limiting
        limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
        limit_req zone=api burst=20 nodelay;

        location / {
            proxy_pass http://canadian_political_bridge;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        location /health {
            proxy_pass http://canadian_political_bridge/health;
            access_log off;
        }
    }
}
```

## 📊 Monitoring & Logging

### 1. Health Checks

```javascript
// Add to your monitoring system
const healthChecks = [
  'http://your-domain.com/health',
  'http://your-domain.com/api/v1/status',
  'http://your-domain.com/api/v1/status/bridges'
];
```

### 2. Logging Configuration

```javascript
// Winston logging configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'canadian-political-bridge' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### 3. Metrics Collection

```javascript
// Prometheus metrics
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const bridgeConnectionStatus = new prometheus.Gauge({
  name: 'bridge_connection_status',
  help: 'Status of bridge connections (1 = connected, 0 = disconnected)',
  labelNames: ['bridge_name']
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Canadian Political Bridge

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: canadian-political-bridge
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster canadian-political-cluster \
            --service canadian-political-bridge \
            --force-new-deployment
```

## 🚀 Production Checklist

### Pre-Deployment
- [ ] Configure all API keys and secrets
- [ ] Set up MongoDB with proper authentication
- [ ] Configure Redis for caching
- [ ] Set up SSL certificates
- [ ] Configure monitoring and alerting
- [ ] Set up backup procedures
- [ ] Test all bridge connections
- [ ] Verify rate limiting configuration
- [ ] Check security headers
- [ ] Test failover procedures

### Post-Deployment
- [ ] Verify all endpoints are responding
- [ ] Check bridge connection status
- [ ] Monitor system resources
- [ ] Verify data synchronization
- [ ] Test API rate limits
- [ ] Check log aggregation
- [ ] Verify backup procedures
- [ ] Test monitoring alerts
- [ ] Document any issues
- [ ] Update team on deployment status

## 🔧 Troubleshooting

### Common Issues

1. **Bridge Connection Failures**
   ```bash
   # Check bridge status
   curl http://localhost:3000/api/v1/status/bridges
   
   # Check logs
   docker-compose logs canadian-political-bridge
   ```

2. **High Memory Usage**
   ```bash
   # Monitor memory usage
   docker stats canadian-political-bridge
   
   # Adjust memory limits in docker-compose.yml
   ```

3. **API Rate Limiting**
   ```bash
   # Check rate limit configuration
   curl -I http://localhost:3000/api/v1/political-parties
   ```

### Performance Optimization

1. **Database Indexing**
   ```javascript
   // MongoDB indexes
   db.parties.createIndex({ "name": 1 })
   db.polling.createIndex({ "date": -1, "party": 1 })
   db.federal_data.createIndex({ "department": 1, "timestamp": -1 })
   ```

2. **Redis Caching**
   ```javascript
   // Optimize cache TTL values
   const cacheConfig = {
     political_data: 180,  // 3 minutes
     federal_data: 300,    // 5 minutes
     electoral_data: 600   // 10 minutes
   };
   ```

This deployment guide ensures a robust, scalable, and secure deployment of the Canadian Political AI Bridge system!
