#!/usr/bin/env pwsh
# Quick Start Script for Fraud Detection Pipeline (Docker)
# This script checks prerequisites and starts the application

Write-Host "🐳 Fraud Detection Pipeline - Docker Quick Start" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "✓ Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "  Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker not found. Please install Docker Desktop." -ForegroundColor Red
    Write-Host "  Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check Docker Compose
Write-Host "✓ Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "  Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker Compose not found. Please install Docker Compose." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
Write-Host "✓ Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "  Docker is running" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting Fraud Detection Pipeline..." -ForegroundColor Cyan
Write-Host ""

# Stop any existing containers
Write-Host "→ Stopping existing containers (if any)..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null

# Build and start services
Write-Host "→ Building Docker images (this may take a few minutes)..." -ForegroundColor Yellow
docker-compose build

Write-Host ""
Write-Host "→ Starting all services..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "→ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host ""
Write-Host "✓ Checking service health..." -ForegroundColor Yellow

$services = @(
    @{Name="MongoDB"; Port=27017},
    @{Name="Kafka"; Port=9092},
    @{Name="API"; Port=8080; Health="http://localhost:8080/health"},
    @{Name="Feature Service"; Port=8081; Health="http://localhost:8081/health"},
    @{Name="Frontend"; Port=3000}
)

foreach ($service in $services) {
    $connection = Test-NetConnection -ComputerName localhost -Port $service.Port -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($connection) {
        Write-Host "  ✓ $($service.Name) is running on port $($service.Port)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $($service.Name) may not be ready yet (port $($service.Port))" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ Fraud Detection Pipeline Started Successfully!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Services Running:" -ForegroundColor White
Write-Host "   • Frontend:         http://localhost:3000" -ForegroundColor Cyan
Write-Host "   • API:              http://localhost:8080" -ForegroundColor Cyan
Write-Host "   • Feature Service:  http://localhost:8081" -ForegroundColor Cyan
Write-Host "   • MongoDB:          localhost:27017" -ForegroundColor Cyan
Write-Host "   • Kafka:            localhost:9092" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Useful Commands:" -ForegroundColor White
Write-Host "   • View logs:        docker-compose logs -f" -ForegroundColor Gray
Write-Host "   • Stop services:    docker-compose stop" -ForegroundColor Gray
Write-Host "   • Restart services: docker-compose restart" -ForegroundColor Gray
Write-Host "   • Remove all:       docker-compose down -v" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor White
Write-Host "   • Docker Guide:     DOCKER_DEPLOY.md" -ForegroundColor Gray
Write-Host "   • Project README:   README.md" -ForegroundColor Gray
Write-Host ""

# Open browser
Start-Sleep -Seconds 2
Write-Host "🌐 Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✅ Setup complete! The application is now running." -ForegroundColor Green
Write-Host ""
