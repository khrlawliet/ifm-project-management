# Makefile for Docker operations
# Usage: make <target>

.PHONY: help build run stop clean logs shell test

# Default target
.DEFAULT_GOAL := help

# Variables
IMAGE_NAME = ifm-project-mgmt-web
CONTAINER_NAME = ifm-frontend
PORT = 3000
API_TARGET ?= http://localhost:8080

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build Docker image
	@echo "Building Docker image..."
	docker build --build-arg VITE_API_TARGET=$(API_TARGET) -t $(IMAGE_NAME):latest .
	@echo "Build complete!"

build-dev: ## Build Docker image with dev settings
	@echo "Building Docker image (development)..."
	docker build -t $(IMAGE_NAME):dev .

run: ## Run container
	@echo "Starting container..."
	docker run -d \
		-p $(PORT):3000 \
		--name $(CONTAINER_NAME) \
		--restart unless-stopped \
		$(IMAGE_NAME):latest
	@echo "Container started at http://localhost:$(PORT)"

run-compose: ## Run using docker-compose
	@echo "Starting services with docker-compose..."
	docker-compose up -d
	@echo "Services started!"

stop: ## Stop running container
	@echo "Stopping container..."
	docker stop $(CONTAINER_NAME) 2>/dev/null || true
	@echo "Container stopped"

stop-compose: ## Stop docker-compose services
	@echo "Stopping services..."
	docker-compose down
	@echo "Services stopped"

restart: stop run ## Restart container

restart-compose: stop-compose run-compose ## Restart docker-compose services

clean: stop ## Remove container and image
	@echo "Cleaning up..."
	docker rm $(CONTAINER_NAME) 2>/dev/null || true
	docker rmi $(IMAGE_NAME):latest 2>/dev/null || true
	@echo "Cleanup complete"

clean-all: clean ## Remove all containers, images, and volumes
	@echo "Removing all related resources..."
	docker-compose down -v 2>/dev/null || true
	docker rmi $(IMAGE_NAME):dev 2>/dev/null || true
	@echo "All resources removed"

logs: ## Show container logs
	docker logs -f $(CONTAINER_NAME)

logs-compose: ## Show docker-compose logs
	docker-compose logs -f

shell: ## Open shell in running container (bash)
	docker exec -it $(CONTAINER_NAME) /bin/sh

ps: ## Show running containers
	docker ps -a | grep $(IMAGE_NAME) || echo "No containers found"

inspect: ## Inspect container
	docker inspect $(CONTAINER_NAME)

stats: ## Show container resource usage
	docker stats $(CONTAINER_NAME)

test: ## Test if container is running
	@curl -f http://localhost:$(PORT) > /dev/null 2>&1 && \
		echo "✓ Container is running and responding" || \
		echo "✗ Container is not responding"

rebuild: clean build run ## Clean, rebuild and run

rebuild-compose: clean-all build run-compose ## Clean, rebuild and run with compose

push: ## Push image to registry (set REGISTRY variable)
	@if [ -z "$(REGISTRY)" ]; then \
		echo "Error: REGISTRY variable not set. Usage: make push REGISTRY=your-registry.com"; \
		exit 1; \
	fi
	docker tag $(IMAGE_NAME):latest $(REGISTRY)/$(IMAGE_NAME):latest
	docker push $(REGISTRY)/$(IMAGE_NAME):latest
	@echo "Image pushed to $(REGISTRY)"

scan: ## Scan image for vulnerabilities
	@command -v trivy >/dev/null 2>&1 || { echo "Trivy not installed. Install from https://github.com/aquasecurity/trivy"; exit 1; }
	trivy image $(IMAGE_NAME):latest

size: ## Show image size
	@docker images $(IMAGE_NAME):latest --format "{{.Repository}}:{{.Tag}} - {{.Size}}"
