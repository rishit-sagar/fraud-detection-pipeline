#!/bin/bash
# Quick Start Script for Fraud Detection Pipeline (Docker)
# This script checks prerequisites and starts the application

echo "🐳 Fraud Detection Pipeline - Docker Quick Start"
echo "================================================="
echo ""

# Check Docker
echo "✓ Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "  Docker found: $DOCKER_VERSION"
else
    echo "  ❌ Docker not found. Please install Docker."
    echo "  Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker Compose
echo "✓ Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo "  Docker Compose found: $COMPOSE_VERSION"
else
    echo "  ❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

# Check if Docker is running
echo "✓ Checking if Docker is running..."
if docker ps &> /dev/null; then
    echo "  Docker is running"
else
    echo "  ❌ Docker is not running. Please start Docker."
    exit 1
fi

echo ""
echo "🚀 Starting Fraud Detection Pipeline..."
echo ""

# Stop any existing containers
echo "→ Stopping existing containers (if any)..."
docker-compose down 2>&1 > /dev/null

# Build and start services
echo "→ Building Docker images (this may take a few minutes)..."
docker-compose build

echo ""
echo "→ Starting all services..."
docker-compose up -d

echo ""
echo "→ Waiting for services to be ready..."
sleep 10

# Check service health
echo ""
echo "✓ Checking service health..."

check_port() {
    nc -z localhost $1 2>/dev/null
    return $?
}

services=("MongoDB:27017" "Kafka:9092" "API:8080" "Feature Service:8081" "Frontend:3000")

for service in "${services[@]}"; do
    IFS=: read -r name port <<< "$service"
    if check_port $port; then
        echo "  ✓ $name is running on port $port"
    else
        echo "  ⚠ $name may not be ready yet (port $port)"
    fi
done

echo ""
echo "═══════════════════════════════════════════════════"
echo "✨ Fraud Detection Pipeline Started Successfully!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📊 Services Running:"
echo "   • Frontend:         http://localhost:3000"
echo "   • API:              http://localhost:8080"
echo "   • Feature Service:  http://localhost:8081"
echo "   • MongoDB:          localhost:27017"
echo "   • Kafka:            localhost:9092"
echo ""
echo "📝 Useful Commands:"
echo "   • View logs:        docker-compose logs -f"
echo "   • Stop services:    docker-compose stop"
echo "   • Restart services: docker-compose restart"
echo "   • Remove all:       docker-compose down -v"
echo ""
echo "📖 Documentation:"
echo "   • Docker Guide:     DOCKER_DEPLOY.md"
echo "   • Project README:   README.md"
echo ""
echo "✅ Setup complete! The application is now running."
echo ""

# Try to open browser (works on most Linux with desktop environment)
if command -v xdg-open &> /dev/null; then
    echo "🌐 Opening browser..."
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    echo "🌐 Opening browser..."
    open http://localhost:3000
fi
