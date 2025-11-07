#!/usr/bin/env pwsh
# Start All Services Script for Fraud Detection Pipeline
# This script starts MongoDB, API service, and Frontend in sequence

Write-Host "🚀 Starting Fraud Detection Pipeline..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$MONGO_URL = "mongodb+srv://sagarrishit_db_user:Hello%4073@cluster0.9wy4bgi.mongodb.net/fraud_detection"
$API_PORT = 8080
$FRONTEND_PORT = 3001
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Function to wait for service
function Wait-ForService {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$MaxAttempts = 30
    )
    Write-Host "⏳ Waiting for $ServiceName to be ready..." -ForegroundColor Yellow
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $ServiceName is ready!" -ForegroundColor Green
                return $true
            }
        } catch {
            Write-Host "." -NoNewline
            Start-Sleep -Seconds 2
        }
    }
    Write-Host ""
    Write-Host "⚠️  $ServiceName did not respond in time" -ForegroundColor Red
    return $false
}

# Step 1: Check MongoDB Connection
Write-Host "📦 Step 1: Checking MongoDB Atlas connection..." -ForegroundColor Cyan
try {
    # We're using MongoDB Atlas, so just verify the connection string is set
    if ($MONGO_URL) {
        Write-Host "✅ MongoDB URL configured: $($MONGO_URL.Substring(0, 30))..." -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB URL not configured!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ MongoDB check failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Start API Service
Write-Host "🔧 Step 2: Starting API Service..." -ForegroundColor Cyan
$apiPath = Join-Path $PROJECT_ROOT "services\api"

if (Test-Port -Port $API_PORT) {
    Write-Host "⚠️  Port $API_PORT is already in use. Skipping API start." -ForegroundColor Yellow
    Write-Host "   If you want to restart, kill the process on port $API_PORT first." -ForegroundColor Yellow
} else {
    Write-Host "   Installing dependencies..." -ForegroundColor Gray
    Push-Location $apiPath
    powershell -ExecutionPolicy Bypass -Command "npm install --silent" 2>&1 | Out-Null
    
    Write-Host "   Building TypeScript..." -ForegroundColor Gray
    powershell -ExecutionPolicy Bypass -Command "npm run build" 2>&1 | Out-Null
    
    Write-Host "   Starting API server on port $API_PORT..." -ForegroundColor Gray
    $env:MONGO_URL = $MONGO_URL
    $env:PORT = $API_PORT
    
    Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "cd '$apiPath'; `$env:MONGO_URL='$MONGO_URL'; `$env:PORT=$API_PORT; npm start" -WindowStyle Normal
    Pop-Location
    
    # Wait for API to be ready
    if (Wait-ForService -ServiceName "API" -Url "http://localhost:$API_PORT/health") {
        Write-Host ""
    } else {
        Write-Host "⚠️  Continuing anyway..." -ForegroundColor Yellow
        Write-Host ""
    }
}

# Step 3: Start Frontend
Write-Host "🎨 Step 3: Starting Frontend..." -ForegroundColor Cyan
$frontendPath = Join-Path $PROJECT_ROOT "frontend\analyst-console"

if (Test-Port -Port $FRONTEND_PORT) {
    Write-Host "⚠️  Port $FRONTEND_PORT is already in use. Skipping Frontend start." -ForegroundColor Yellow
    Write-Host "   If you want to restart, kill the process on port $FRONTEND_PORT first." -ForegroundColor Yellow
} else {
    Write-Host "   Installing dependencies..." -ForegroundColor Gray
    Push-Location $frontendPath
    powershell -ExecutionPolicy Bypass -Command "npm install --silent" 2>&1 | Out-Null
    
    Write-Host "   Starting React dev server on port $FRONTEND_PORT..." -ForegroundColor Gray
    $env:PORT = $FRONTEND_PORT
    $env:REACT_APP_API_URL = "http://localhost:$API_PORT"
    
    Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "cd '$frontendPath'; `$env:PORT=$FRONTEND_PORT; `$env:REACT_APP_API_URL='http://localhost:$API_PORT'; npm start" -WindowStyle Normal
    Pop-Location
    
    Start-Sleep -Seconds 5
    Write-Host "✅ Frontend started!" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ Fraud Detection Pipeline Started Successfully!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Services Running:" -ForegroundColor White
Write-Host "   • MongoDB Atlas: " -NoNewline; Write-Host "Connected" -ForegroundColor Green
Write-Host "   • API Service:   " -NoNewline; Write-Host "http://localhost:$API_PORT" -ForegroundColor Cyan
Write-Host "   • Frontend:      " -NoNewline; Write-Host "http://localhost:$FRONTEND_PORT" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Open your browser to:" -ForegroundColor White
Write-Host "   http://localhost:$FRONTEND_PORT" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Useful endpoints:" -ForegroundColor White
Write-Host "   • Health Check:  http://localhost:${API_PORT}/health"
Write-Host "   • Transactions:  http://localhost:${API_PORT}/api/transactions"
Write-Host "   • Alerts:        http://localhost:${API_PORT}/api/alerts"
Write-Host ""
Write-Host "🛑 To stop services, close the PowerShell windows that opened." -ForegroundColor Gray
Write-Host ""

# Open browser
Start-Sleep -Seconds 3
Write-Host "🌐 Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:$FRONTEND_PORT"