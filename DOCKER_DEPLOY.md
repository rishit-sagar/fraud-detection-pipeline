# Docker Deployment Guide

This guide explains how to deploy the complete Fraud Detection Pipeline using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+ 
- Docker Compose 2.0+
- At least 4GB RAM available
- Ports 3000, 8080, 8081, 9092, 27017, 2181 available

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/rishit-sagar/fraud-detection-pipeline.git
cd fraud-detection-pipeline
```

### 2. Start All Services

```bash
docker-compose up -d
```

This command will:
- Build Docker images for API, Feature Service, and Frontend
- Pull MongoDB, Kafka, and Zookeeper images
- Start all services with proper dependencies
- Create necessary networks and volumes

### 3. Verify Services

Check that all services are running:

```bash
docker-compose ps
```

Expected output should show all services as "Up" or "healthy".

### 4. Access the Application

- **Frontend (Analyst Console):** http://localhost:3000
- **API Health Check:** http://localhost:8080/health
- **API Transactions:** http://localhost:8080/api/transactions
- **Feature Service Health:** http://localhost:8081/health

## Service Architecture

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React-based analyst console (Nginx) |
| API | 8080 | Node.js/Express REST API |
| Feature Service | 8081 | Online feature extraction service |
| MongoDB | 27017 | Document database |
| Kafka | 9092 | Message broker (external) |
| Kafka | 9093 | Message broker (internal) |
| Zookeeper | 2181 | Kafka coordination service |

## Detailed Commands

### Build Services

Build all Docker images without starting:

```bash
docker-compose build
```

Build a specific service:

```bash
docker-compose build api
docker-compose build frontend
docker-compose build feature-service
```

### Start Services

Start all services in detached mode:

```bash
docker-compose up -d
```

Start with logs visible:

```bash
docker-compose up
```

Start specific services:

```bash
docker-compose up -d mongo kafka api
```

### View Logs

View logs for all services:

```bash
docker-compose logs -f
```

View logs for a specific service:

```bash
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f feature-service
```

### Stop Services

Stop all services (keep data):

```bash
docker-compose stop
```

Stop and remove containers (keep data):

```bash
docker-compose down
```

Stop and remove everything including volumes:

```bash
docker-compose down -v
```

### Restart Services

Restart all services:

```bash
docker-compose restart
```

Restart a specific service:

```bash
docker-compose restart api
```

### Health Checks

All services include health checks. Check service health:

```bash
docker-compose ps
```

Or check individual health endpoints:

```bash
curl http://localhost:8080/health
curl http://localhost:8081/health
```

## Database Seeding

To populate the database with sample transactions:

### Option 1: Use the API seeding script

```bash
# Enter the API container
docker-compose exec api sh

# Run the seed script
npm run seed

# Exit container
exit
```

### Option 2: Manual seeding from host

```bash
# If you have Node.js installed locally
cd services/api
npm install
npm run seed
```

## Troubleshooting

### Services won't start

1. Check if ports are already in use:
   ```bash
   netstat -ano | findstr "3000 8080 8081 9092 27017 2181"
   ```

2. Check Docker resources:
   ```bash
   docker system df
   docker system prune
   ```

3. View detailed logs:
   ```bash
   docker-compose logs
   ```

### MongoDB connection issues

1. Verify MongoDB is healthy:
   ```bash
   docker-compose ps mongo
   ```

2. Check MongoDB logs:
   ```bash
   docker-compose logs mongo
   ```

3. Test connection:
   ```bash
   docker-compose exec mongo mongosh fraud_detection
   ```

### Kafka issues

1. Check Kafka and Zookeeper status:
   ```bash
   docker-compose ps kafka zookeeper
   ```

2. List Kafka topics:
   ```bash
   docker-compose exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092
   ```

3. Create topic manually if needed:
   ```bash
   docker-compose exec kafka kafka-topics.sh --create --topic transactions --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
   ```

### API or Feature Service crashes

1. Check service logs:
   ```bash
   docker-compose logs api
   docker-compose logs feature-service
   ```

2. Rebuild the service:
   ```bash
   docker-compose build --no-cache api
   docker-compose up -d api
   ```

### Frontend not loading

1. Check nginx logs:
   ```bash
   docker-compose logs frontend
   ```

2. Rebuild frontend:
   ```bash
   docker-compose build --no-cache frontend
   docker-compose up -d frontend
   ```

3. Check API URL configuration in the frontend container

## Environment Variables

You can customize services by creating a `.env` file in the root directory:

```env
# API Configuration
API_PORT=8080
MONGO_URL=mongodb://mongo:27017/fraud_detection

# Kafka Configuration
KAFKA_BROKERS=kafka:9093
KAFKA_TOPIC=transactions

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8080

# Node Environment
NODE_ENV=production
```

## Production Deployment

For production deployment on AWS EC2, Azure VM, or other cloud providers:

### 1. Server Requirements

- Ubuntu 20.04+ or Amazon Linux 2
- 4GB RAM minimum (8GB recommended)
- 20GB disk space
- Docker and Docker Compose installed

### 2. Install Docker on EC2 (Amazon Linux 2)

```bash
# Update packages
sudo yum update -y

# Install Docker
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for group changes to take effect
```

### 3. Install Docker on EC2 (Ubuntu)

```bash
# Update packages
sudo apt-get update

# Install prerequisites
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Add Docker repository
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 4. Configure Security Group (AWS EC2)

Open the following ports in your EC2 security group:
- 22 (SSH)
- 3000 (Frontend)
- 8080 (API)
- 8081 (Feature Service) - Optional, for internal use

### 5. Deploy Application

```bash
# Clone repository
git clone https://github.com/rishit-sagar/fraud-detection-pipeline.git
cd fraud-detection-pipeline

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 6. Set Up Reverse Proxy (Optional)

For production, consider using Nginx as a reverse proxy:

```bash
sudo apt-get install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/fraud-detection
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/fraud-detection /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Set Up SSL (Optional but Recommended)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Monitoring

### Check Service Status

```bash
docker-compose ps
docker stats
```

### View Resource Usage

```bash
docker stats $(docker-compose ps -q)
```

### Set Up Persistent Logging

Configure Docker logging driver in `docker-compose.yml`:

```yaml
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Backup and Restore

### Backup MongoDB Data

```bash
# Create backup
docker-compose exec mongo mongodump --out /data/backup

# Copy backup to host
docker cp fraud_detection_mongo:/data/backup ./mongo_backup
```

### Restore MongoDB Data

```bash
# Copy backup to container
docker cp ./mongo_backup fraud_detection_mongo:/data/backup

# Restore
docker-compose exec mongo mongorestore /data/backup
```

## Scaling Services

To run multiple instances of a service:

```bash
docker-compose up -d --scale api=3
```

Note: You'll need to configure a load balancer for this setup.

## Updates and Maintenance

### Update Application Code

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Update Docker Images

```bash
# Pull latest base images
docker-compose pull

# Rebuild services
docker-compose build
docker-compose up -d
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Kafka Docker Documentation](https://github.com/wurstmeister/kafka-docker)

## Support

For issues or questions:
- GitHub Issues: https://github.com/rishit-sagar/fraud-detection-pipeline/issues
- Project Documentation: See README.md

## License

This project is licensed under the MIT License.
