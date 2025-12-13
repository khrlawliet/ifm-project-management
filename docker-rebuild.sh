#!/bin/bash

# ============================================
# Docker Image Rebuild Script (Linux/Mac)
# ============================================
# This script rebuilds Docker images for both
# API and Web, then starts the containers.
# ============================================

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to handle errors
handle_error() {
    print_error "$1"
    exit 1
}

echo ""
echo "========================================"
echo " IFM Project - Docker Rebuild Script"
echo "========================================"
echo ""

# Step 1: Stop and remove existing containers
print_info "[1/5] Stopping existing containers..."
if docker-compose down; then
    print_success "Containers stopped."
else
    print_warning "Error stopping containers (they might not be running)"
fi
echo ""

# Step 2: Remove old images (optional)
print_info "[2/5] Removing old Docker images..."
# Uncomment the next line to remove old images before rebuilding
# docker rmi ifm-ifm-project-mgmt-api ifm-ifm-project-mgmt-web 2>/dev/null || true
print_warning "Skipped (to enable: uncomment line in script)"
echo ""

# Step 3: Build API image
print_info "[3/5] Building API (Backend) image..."
print_info "Building from: ./ifm-project-mgmt-api"
if docker build -t ifm-ifm-project-mgmt-api ./ifm-project-mgmt-api --no-cache; then
    print_success "API image built successfully."
else
    handle_error "API build failed!"
fi
echo ""

# Step 4: Build Web image
print_info "[4/5] Building Web (Frontend) image..."
print_info "Building from: ./ifm-project-mgmt-web"
if docker build -t ifm-ifm-project-mgmt-web ./ifm-project-mgmt-web --no-cache --build-arg VITE_API_TARGET=http://api:8080; then
    print_success "Web image built successfully."
else
    handle_error "Web build failed!"
fi
echo ""

# Step 5: Start containers with docker-compose
print_info "[5/5] Starting containers with docker-compose..."
if docker-compose up -d; then
    print_success "Containers started successfully!"
else
    handle_error "Failed to start containers!"
fi
echo ""

# Show running containers
echo "========================================"
echo " Containers Started Successfully!"
echo "========================================"
echo ""
docker-compose ps
echo ""

# Display access URLs
echo "========================================"
echo " Access URLs:"
echo "========================================"
echo -e "${GREEN}API Backend:${NC}  http://localhost:8080"
echo -e "${GREEN}Web Frontend:${NC} http://localhost:3000"
echo "========================================"
echo ""

# Display helpful commands
print_info "To view logs, run:"
echo "  docker-compose logs -f"
echo ""
print_info "To stop containers, run:"
echo "  docker-compose down"
echo ""

print_success "Rebuild complete!"
