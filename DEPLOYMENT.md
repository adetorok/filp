# 🚀 Production Deployment Guide

## Prerequisites

### Database Setup
```bash
# Install PostgreSQL
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/

# Create database
createdb homeflip_production
```

### Redis Setup (for job queues)
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Windows
# Download from https://github.com/microsoftarchive/redis/releases
```

### Environment Variables
Create `.env.production`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/homeflip_production"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRES_IN=24h

# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# File Storage (S3-compatible)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=homeflip-files
S3_ENDPOINT=https://s3.amazonaws.com

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Monitoring
SENTRY_DSN=your_sentry_dsn
UPTIME_ROBOT_API_KEY=your_uptime_robot_key

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment Steps

### 1. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
node server/seed.js
```

### 2. Application Deployment

#### Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'homeflip-api',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Using Docker
```bash
# Create Dockerfile
cat > Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "server/index.js"]
EOF

# Build and run
docker build -t homeflip-api .
docker run -d --name homeflip-api -p 5000:5000 --env-file .env.production homeflip-api
```

### 3. Reverse Proxy (Nginx)
```nginx
# /etc/nginx/sites-available/homeflip
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API Proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend (if serving from same server)
    location / {
        root /var/www/homeflip/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

### 4. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5. Database Backups
```bash
# Create backup script
cat > backup.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/homeflip"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="homeflip_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

# Create backup
pg_dump homeflip_production > $BACKUP_DIR/$BACKUP_FILE

# Compress
gzip $BACKUP_DIR/$BACKUP_FILE

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/$BACKUP_FILE.gz s3://your-backup-bucket/

# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Schedule daily backups
echo "0 2 * * * /path/to/backup.sh" | sudo crontab -
```

### 6. Monitoring Setup

#### Health Checks
```bash
# Create health check script
cat > health_check.sh << EOF
#!/bin/bash
HEALTH_URL="https://yourdomain.com/api/health/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "Health check passed"
    exit 0
else
    echo "Health check failed with status: $RESPONSE"
    # Restart application
    pm2 restart homeflip-api
    exit 1
fi
EOF

chmod +x health_check.sh

# Schedule health checks every 5 minutes
echo "*/5 * * * * /path/to/health_check.sh" | crontab -
```

#### Log Management
```bash
# Install logrotate
sudo apt-get install logrotate

# Create logrotate config
cat > /etc/logrotate.d/homeflip << EOF
/var/log/homeflip/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

## Security Checklist

### ✅ **Completed Security Measures**
- [x] **HTTPS Enforcement** - All traffic encrypted
- [x] **Security Headers** - CSP, HSTS, XSS protection
- [x] **Rate Limiting** - Prevents abuse and DoS
- [x] **Input Validation** - Prevents injection attacks
- [x] **Authentication** - JWT with secure secrets
- [x] **Authorization** - RBAC with granular permissions
- [x] **Audit Logging** - All actions tracked
- [x] **Data Encryption** - Sensitive data encrypted at rest
- [x] **Database Security** - Unique constraints and indexes
- [x] **File Upload Security** - Virus scanning and validation

### 🔒 **Additional Security Recommendations**
- [ ] **WAF (Web Application Firewall)** - CloudFlare or AWS WAF
- [ ] **DDoS Protection** - CloudFlare or AWS Shield
- [ ] **Intrusion Detection** - Fail2ban or similar
- [ ] **Vulnerability Scanning** - Regular security scans
- [ ] **Penetration Testing** - Annual security audits
- [ ] **Security Monitoring** - SIEM integration
- [ ] **Backup Encryption** - Encrypted database backups
- [ ] **Network Segmentation** - Isolated database network

## Performance Optimization

### Database Optimization
```sql
-- Create additional indexes for common queries
CREATE INDEX CONCURRENTLY idx_properties_user_status ON properties(user_id, status);
CREATE INDEX CONCURRENTLY idx_deals_user_status ON deals(user_id, status);
CREATE INDEX CONCURRENTLY idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX CONCURRENTLY idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX CONCURRENTLY idx_contractors_score ON contractors USING btree(overall_score DESC);
CREATE INDEX CONCURRENTLY idx_contractor_reviews_contractor_stars ON contractor_reviews(contractor_id, stars);

-- Analyze tables for query optimization
ANALYZE;
```

### Application Optimization
```bash
# Enable gzip compression
# Add to nginx config:
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Enable caching
# Add to nginx config:
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Monitoring & Alerting

### Key Metrics to Monitor
- **Response Time** - P95 latency < 500ms
- **Error Rate** - < 1% 5xx errors
- **Throughput** - Requests per second
- **Database Performance** - Query execution time
- **Memory Usage** - Node.js heap usage
- **CPU Usage** - Server CPU utilization
- **Disk Usage** - Database and log storage
- **Queue Length** - Background job queue size

### Alert Thresholds
- **Response Time** > 1000ms for 5 minutes
- **Error Rate** > 5% for 2 minutes
- **Memory Usage** > 80% for 5 minutes
- **CPU Usage** > 90% for 5 minutes
- **Disk Usage** > 85%
- **Queue Length** > 1000 jobs

## Disaster Recovery

### Backup Strategy
- **Database Backups** - Daily full backups, hourly incremental
- **File Backups** - S3 cross-region replication
- **Configuration Backups** - Version controlled configs
- **Code Backups** - Git repository with multiple remotes

### Recovery Procedures
1. **Database Recovery** - Restore from latest backup
2. **Application Recovery** - Deploy from Git, restore configs
3. **File Recovery** - Restore from S3 backup
4. **DNS Failover** - Update DNS to point to backup region

### RTO/RPO Targets
- **RTO (Recovery Time Objective)** - 4 hours
- **RPO (Recovery Point Objective)** - 1 hour
- **Availability Target** - 99.9% (8.76 hours downtime/year)

## Scaling Considerations

### Horizontal Scaling
- **Load Balancer** - Multiple application instances
- **Database Read Replicas** - Read-only database copies
- **CDN** - Static asset delivery
- **Microservices** - Split into smaller services

### Vertical Scaling
- **Database** - More CPU/RAM for PostgreSQL
- **Application** - More CPU/RAM for Node.js
- **Storage** - SSD storage for better I/O

## Maintenance Windows

### Regular Maintenance
- **Security Updates** - Monthly
- **Dependency Updates** - Quarterly
- **Database Maintenance** - Weekly (VACUUM, ANALYZE)
- **Log Cleanup** - Daily
- **Backup Verification** - Weekly

### Emergency Procedures
- **Incident Response** - 24/7 on-call rotation
- **Rollback Procedures** - Quick rollback to previous version
- **Communication** - Status page and notifications
- **Post-Mortem** - Root cause analysis and improvements

## Support & Documentation

### API Documentation
- **OpenAPI Spec** - Available at `/api/docs`
- **Postman Collection** - Available for testing
- **SDK Examples** - Code examples in multiple languages

### Monitoring Dashboards
- **Application Metrics** - Grafana dashboards
- **Database Metrics** - PostgreSQL monitoring
- **Infrastructure Metrics** - Server monitoring
- **Business Metrics** - Custom dashboards

### Contact Information
- **Technical Support** - support@homeflip.com
- **Emergency Contact** - +1-555-HOMEFLIP
- **Status Page** - https://status.homeflip.com
- **Documentation** - https://docs.homeflip.com
