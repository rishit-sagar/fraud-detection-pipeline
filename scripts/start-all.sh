#!/bin/bash

# Start the MongoDB service
docker-compose -f infra/docker/docker-compose.yml up -d

# Start Kafka and its dependencies
docker-compose -f services/kafka/docker/docker-compose.yml up -d

# Start the API service
cd services/api && npm install && npm start &

# Start the Online Feature Extraction service
cd ../online-feature-service && npm install && npm start &

# Wait for services to initialize
sleep 10

# Start the frontend console
cd ../../frontend/console && npm install && npm start &

# Wait for all services to be up
wait

echo "All services have been started."