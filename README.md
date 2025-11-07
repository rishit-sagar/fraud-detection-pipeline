# 🛡️ Real-Time Fraud Detection Pipeline

A complete MERN stack fraud detection system with streaming ingestion, ML-based risk scoring, and an analyst review console.

## 🌐 **LIVE DEMO**

**✨ Analyst Console:** https://rishit-sagar.github.io/fraud-detection-pipeline/

**📦 GitHub Repository:** https://github.com/rishit-sagar/fraud-detection-pipeline

The frontend is live with demo data. For full backend integration, see deployment guide below.

## Project Structure

```
fraud-detection-pipeline
├── services
│   ├── api                  # API service for handling transaction data
│   ├── online-feature-service # Service for online feature extraction
│   ├── model-training       # Service for training machine learning models
│   └── kafka                # Kafka configuration and connectors
├── frontend
│   └── console              # React console for analysts
├── infra                    # Infrastructure setup (MongoDB, Docker)
├── scripts                  # Scripts for automation
├── .gitignore               # Git ignore file
└── README.md                # Project documentation
```

## Features

- **Real-time Transaction Monitoring**: The pipeline ingests transaction data in real-time using Kafka.
- **Feature Extraction**: Online feature extraction service processes incoming transactions to generate relevant features for fraud detection.
- **Machine Learning Model**: A trained model that predicts fraudulent transactions based on historical data.
- **Analyst Console**: A React-based console for analysts to review flagged transactions and take necessary actions.

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** installed and running ([Download here](https://www.docker.com/products/docker-desktop))
- **Docker Compose** (included with Docker Desktop)
- At least 4GB RAM available for Docker
- Ports available: 3000, 8080, 8081, 9092, 27017, 2181

### Option 1: Docker Compose (Recommended) ⭐

The easiest way to run the entire application:

```bash
# Clone the repository
git clone https://github.com/rishit-sagar/fraud-detection-pipeline.git
cd fraud-detection-pipeline

# Start all services
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

**Or use the quick start script:**

**Windows (PowerShell):**
```powershell
.\docker-start.ps1
```

**Linux/Mac:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

### Option 2: Manual Setup (Without Docker)

If you prefer to run services locally:

1. **Start Infrastructure Services** (MongoDB, Kafka, Zookeeper):
   ```bash
   cd infra/docker
   docker-compose up -d
   ```

2. **Start API Service**:
   ```bash
   cd services/api
   npm install
   npm run build
   npm start
   # Runs on http://localhost:8080
   ```

3. **Start Feature Service**:
   ```bash
   cd services/online-feature-service
   npm install
   npm run build
   npm start
   # Runs on http://localhost:8081
   ```

4. **Start Frontend**:
   ```bash
   cd frontend/analyst-console
   npm install
   npm start
   # Runs on http://localhost:3000
   ```

## 🌐 Access the Application

Once all services are running:

- **Frontend Console**: http://localhost:3000
- **API Endpoint**: http://localhost:8080
- **API Health Check**: http://localhost:8080/health
- **Feature Service**: http://localhost:8081/health

## 📝 Common Commands

```bash
# Start all services
docker-compose up -d

# Stop all services (keeps data)
docker-compose stop

# Restart all services
docker-compose restart

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api

# Stop and remove containers (keeps data)
docker-compose down

# Stop and remove everything including volumes (deletes data)
docker-compose down -v

# Check service status
docker-compose ps
```

## 📖 Documentation

- **Docker Deployment Guide**: See [DOCKER_DEPLOY.md](DOCKER_DEPLOY.md) for detailed Docker instructions
- **Production Deployment**: See [DOCKER_DEPLOY.md](DOCKER_DEPLOY.md) for EC2/cloud deployment instructions
- **Production Readiness**: See [PRODUCTION_READY.md](PRODUCTION_READY.md) for production checklist

## Aesthetic Design

The frontend console is designed with a monotonous color palette to ensure a clean and professional look, enhancing the user experience for analysts.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.