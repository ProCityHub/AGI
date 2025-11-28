# 🚀 Truth Social Bridge Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Truth Social AI Bridge System in various environments, from development to production.

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **MongoDB**: Version 5.0 or higher
- **Redis**: Version 6.0 or higher
- **Memory**: Minimum 4GB RAM (8GB+ recommended for production)
- **Storage**: Minimum 20GB free space (100GB+ recommended for production)

### API Keys and Credentials
- Truth Social API credentials (if available)
- OpenAI API key (for AI analysis)
- MongoDB connection string
- Redis connection details
- Email SMTP credentials (for notifications)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ProCityHub/AGI.git
cd AGI/truth-social-bridge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy the example configuration
cp config/config.example.json config/config.json

# Create environment file
cp .env.example .env
```

### 4. Configure Environment Variables

Edit the `.env` file with your specific configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Truth Social API
TRUTH_SOCIAL_API_KEY=your_api_key_here
TRUTH_SOCIAL_API_SECRET=your_api_secret_here
TRUTH_SOCIAL_BASE_URL=https://truthsocial.com/api/v1

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/truth_social_bridge
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# AI Services
OPENAI_API_KEY=your_openai_api_key_here

# Security
JWT_SECRET=your_jwt_secret_here
WEBHOOK_SECRET=your_webhook_secret_here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 🏗️ Development Deployment

### Local Development Setup

1. **Start Required Services**

```bash
# Start MongoDB (if running locally)
mongod --dbpath /path/to/your/db

# Start Redis (if running locally)
redis-server
```

2. **Start the Application**

```bash
# Development mode with hot reload
npm run dev

# Or build and start
npm run build
npm start
```

3. **Verify Installation**

```bash
# Check health endpoint
curl http://localhost:3000/health

# Check API status
curl http://localhost:3000/api/v1
```

### Docker Development

```bash
# Build the Docker image
docker build -t truth-social-bridge .

# Run with Docker Compose
docker-compose up -d
```

## 🌐 Production Deployment

### Option 1: Traditional Server Deployment

#### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Redis
sudo apt install redis-server
```

#### 2. Application Deployment

```bash
# Clone and setup application
git clone https://github.com/ProCityHub/AGI.git
cd AGI/truth-social-bridge
npm install
npm run build

# Configure production environment
cp config/config.example.json config/config.json
# Edit config.json with production settings

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Docker Production Deployment

#### 1. Docker Compose Production

```yaml
version: '3.8'

services:
  truth-social-bridge:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/truth_social_bridge
      - REDIS_HOST=redis
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped

  mongodb:
    image: mongo:5.0
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:6.2-alpine
    volumes:
      - redis_data:/data
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
      - truth-social-bridge
    restart: unless-stopped

volumes:
  mongodb_data:
  redis_data:
```

#### 2. Deploy with Docker Compose

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose logs -f truth-social-bridge
```

### Option 3: Cloud Platform Deployment

#### AWS Deployment

1. **EC2 Instance Setup**

```bash
# Launch EC2 instance (t3.medium or larger recommended)
# Configure security groups (ports 22, 80, 443)
# Install Docker and Docker Compose
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user
```

2. **RDS and ElastiCache Setup**

```bash
# Create MongoDB Atlas cluster or RDS instance
# Create ElastiCache Redis cluster
# Update connection strings in configuration
```

#### Google Cloud Platform

```bash
# Deploy to Google Cloud Run
gcloud run deploy truth-social-bridge \
  --image gcr.io/PROJECT_ID/truth-social-bridge \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure Container Instances

```bash
# Deploy to Azure
az container create \
  --resource-group myResourceGroup \
  --name truth-social-bridge \
  --image yourdockerhub/truth-social-bridge \
  --dns-name-label truth-social-bridge \
  --ports 3000
```

## 🔧 Configuration

### Production Configuration Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure database connections
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Set up health checks
- [ ] Configure auto-scaling (if applicable)

### Security Configuration

```json
{
  "security": {
    "rateLimiting": {
      "windowMs": 900000,
      "maxRequests": 100
    },
    "cors": {
      "allowedOrigins": ["https://yourdomain.com"]
    },
    "helmet": {
      "contentSecurityPolicy": true,
      "hsts": true
    }
  }
}
```

## 📊 Monitoring and Maintenance

### Health Checks

```bash
# Application health
curl https://yourdomain.com/health

# API status
curl https://yourdomain.com/api/v1

# Database connectivity
curl https://yourdomain.com/api/v1/truth-social/stats
```

### Log Management

```bash
# PM2 logs
pm2 logs truth-social-bridge

# Docker logs
docker-compose logs -f truth-social-bridge

# Application logs
tail -f logs/combined.log
```

### Performance Monitoring

- Set up application performance monitoring (APM)
- Configure database monitoring
- Set up alerting for critical metrics
- Monitor API response times
- Track error rates and system health

## 🔄 Updates and Maintenance

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart with PM2
pm2 restart truth-social-bridge

# Or with Docker
docker-compose pull
docker-compose up -d
```

### Database Maintenance

```bash
# MongoDB maintenance
mongodump --db truth_social_bridge --out /backup/$(date +%Y%m%d)

# Redis maintenance
redis-cli BGSAVE
```

## 🚨 Troubleshooting

### Common Issues

1. **API Connection Failures**
   - Check Truth Social API credentials
   - Verify network connectivity
   - Check rate limiting status

2. **Database Connection Issues**
   - Verify MongoDB/Redis connectivity
   - Check authentication credentials
   - Ensure proper network configuration

3. **High Memory Usage**
   - Monitor Node.js heap usage
   - Check for memory leaks
   - Consider increasing server resources

4. **Performance Issues**
   - Monitor API response times
   - Check database query performance
   - Review rate limiting configuration

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=debug
npm start

# Or with PM2
pm2 restart truth-social-bridge --update-env
```

## 📞 Support

For deployment support and troubleshooting:

- **Documentation**: [GitHub Repository](https://github.com/ProCityHub/AGI/tree/main/truth-social-bridge)
- **Issues**: [GitHub Issues](https://github.com/ProCityHub/AGI/issues)
- **Community**: [Discussions](https://github.com/ProCityHub/AGI/discussions)

## 📄 License

This deployment guide is part of the Truth Social Bridge project, licensed under the MIT License.

