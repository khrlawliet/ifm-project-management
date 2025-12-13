#!/bin/bash

# IFM Project Management - Development Startup Script
# This script starts both the backend API and frontend web application

set -e

echo "========================================"
echo "IFM Project Management - Starting..."
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "${YELLOW}Shutting down services...${NC}"
    kill 0
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "${YELLOW}Node.js is not installed. Please install Node.js 20+ first.${NC}"
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "${YELLOW}Maven is not installed. Please install Maven 3.6+ first.${NC}"
    exit 1
fi

# Check if web dependencies are installed
if [ ! -d "ifm-project-mgmt-web/node_modules" ]; then
    echo "${BLUE}[WEB]${NC} Installing dependencies..."
    cd ifm-project-mgmt-web
    npm install
    cd ..
    echo ""
fi

# Start Backend API
echo "${BLUE}[API]${NC} Starting Spring Boot API on http://localhost:8080"
cd ifm-project-mgmt-api
mvn spring-boot:run > ../api.log 2>&1 &
API_PID=$!
cd ..

# Wait a moment for API to start
sleep 2

# Start Frontend Web
echo "${GREEN}[WEB]${NC} Starting React Web App on http://localhost:3000"
cd ifm-project-mgmt-web
npm run dev > ../web.log 2>&1 &
WEB_PID=$!
cd ..

echo ""
echo "========================================"
echo "${GREEN}✓ Services Started Successfully!${NC}"
echo "========================================"
echo ""
echo "Access points:"
echo "  • Web App:    http://localhost:3000"
echo "  • API:        http://localhost:8080"
echo "  • Swagger:    http://localhost:8080/swagger-ui.html"
echo "  • H2 Console: http://localhost:8080/h2-console"
echo ""
echo "Logs:"
echo "  • API logs: tail -f api.log"
echo "  • Web logs: tail -f web.log"
echo ""
echo "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for background processes
wait
