#!/bin/bash

# build-and-deploy.sh
# Automated build and deployment script for IFM Project Management System

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to print section headers
print_header() {
    echo ""
    print_message "$BLUE" "=========================================="
    print_message "$BLUE" "$1"
    print_message "$BLUE" "=========================================="
}

# Check if Docker is running
check_docker() {
    print_header "Checking Docker"
    if ! docker info > /dev/null 2>&1; then
        print_message "$RED" "Error: Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_message "$GREEN" "✓ Docker is running"
}

# Stop and remove existing containers
cleanup() {
    print_header "Cleaning up existing containers"

    if [ "$(docker ps -q -f name=ifm-)" ]; then
        print_message "$YELLOW" "Stopping running containers..."
        docker-compose down
        print_message "$GREEN" "✓ Containers stopped"
    else
        print_message "$YELLOW" "No running containers found"
    fi
}

# Build Docker images
build_images() {
    print_header "Building Docker images"

    print_message "$YELLOW" "Building API image..."
    docker-compose build api
    print_message "$GREEN" "✓ API image built successfully"

    print_message "$YELLOW" "Building Web image..."
    docker-compose build web
    print_message "$GREEN" "✓ Web image built successfully"
}

# Start containers
start_containers() {
    print_header "Starting containers"

    print_message "$YELLOW" "Starting services with docker-compose..."
    docker-compose up -d

    print_message "$GREEN" "✓ Containers started successfully"
}

# Check container health
check_health() {
    print_header "Checking container health"

    print_message "$YELLOW" "Waiting for services to be healthy..."
    sleep 5

    # Check API container
    if docker ps --filter "name=ifm-api" --filter "status=running" | grep -q ifm-api; then
        print_message "$GREEN" "✓ API container is running"
    else
        print_message "$RED" "✗ API container is not running"
    fi

    # Check Web container
    if docker ps --filter "name=ifm-web" --filter "status=running" | grep -q ifm-web; then
        print_message "$GREEN" "✓ Web container is running"
    else
        print_message "$RED" "✗ Web container is not running"
    fi
}

# Display service URLs
display_urls() {
    print_header "Deployment Complete!"

    echo ""
    print_message "$GREEN" "Services are now running:"
    print_message "$BLUE" "  • Frontend:  http://localhost:3000"
    print_message "$BLUE" "  • API:       http://localhost:8080"
    print_message "$BLUE" "  • Swagger:   http://localhost:8080/swagger-ui.html"
    echo ""
    print_message "$YELLOW" "Useful commands:"
    print_message "$NC" "  • View logs:        docker-compose logs -f"
    print_message "$NC" "  • Stop services:    docker-compose down"
    print_message "$NC" "  • Restart services: docker-compose restart"
    echo ""
}

# Main execution
main() {
    print_header "IFM Project Management - Build & Deploy"

    check_docker
    cleanup
    build_images
    start_containers
    check_health
    display_urls
}

# Run main function
main
