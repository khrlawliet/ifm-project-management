# Docker Deployment Guide

This guide explains how to build and run the application using Docker with a distroless base image.

## Overview

The Dockerfile uses a **multi-stage build** approach:
- **Stage 1 (Builder)**: Uses `node:20-alpine` to build the React application
- **Stage 2 (Production)**: Uses `gcr.io/distroless/nodejs20-debian12` for a minimal, secure runtime

### Benefits of Distroless

- **Minimal attack surface**: No shell, package managers, or unnecessary binaries
- **Smaller image size**: Only includes runtime dependencies
- **Enhanced security**: Reduces vulnerabilities and potential attack vectors

## Prerequisites

- Docker installed (version 20.10 or higher recommended)
- Docker Compose (optional, for easier orchestration)

## Building the Docker Image

### Basic Build

```bash
docker build -t ifm-project-mgmt-web:latest .
```

### Build with Custom API Target

```bash
docker build \
  --build-arg VITE_API_TARGET=http://your-api-server:8080 \
  -t ifm-project-mgmt-web:latest .
```

## Running the Container

### Using Docker Run

**Basic run:**
```bash
docker run -p 3000:3000 ifm-project-mgmt-web:latest
```

**With custom API target:**
```bash
docker run \
  -p 3000:3000 \
  -e VITE_API_TARGET=http://your-api-server:8080 \
  ifm-project-mgmt-web:latest
```

**With restart policy:**
```bash
docker run -d \
  -p 3000:3000 \
  --name ifm-frontend \
  --restart unless-stopped \
  ifm-project-mgmt-web:latest
```

### Using Docker Compose

**Start the application:**
```bash
docker-compose up -d
```

**Stop the application:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f frontend
```

**Rebuild and restart:**
```bash
docker-compose up -d --build
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_TARGET` | Backend API server URL | `http://localhost:8080` |

### Setting Environment Variables

**Option 1: Using .env file**
```bash
# Create .env file
echo "VITE_API_TARGET=http://api.example.com:8080" > .env

# Run with docker-compose
docker-compose up -d
```

**Option 2: Using command line**
```bash
VITE_API_TARGET=http://api.example.com:8080 docker-compose up -d
```

**Option 3: Using docker run**
```bash
docker run -p 3000:3000 -e VITE_API_TARGET=http://api.example.com:8080 ifm-project-mgmt-web:latest
```

## Advanced Usage

### Multi-Platform Build

Build for multiple architectures (e.g., amd64 and arm64):

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ifm-project-mgmt-web:latest \
  --push .
```

### Health Check

Add a health check to your container:

```bash
docker run -d \
  -p 3000:3000 \
  --name ifm-frontend \
  --health-cmd="wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  ifm-project-mgmt-web:latest
```

### Volume Mounting (Development)

For development with hot reload, mount your source code:

```bash
docker run -p 3000:3000 \
  -v $(pwd)/src:/app/src \
  ifm-project-mgmt-web:latest
```

## Troubleshooting

### Container won't start

**Check logs:**
```bash
docker logs ifm-frontend
```

**Verify port availability:**
```bash
# Check if port 3000 is already in use
netstat -an | grep 3000
# or on Windows
netstat -ano | findstr :3000
```

### Cannot connect to API

**Verify API target configuration:**
```bash
docker exec ifm-frontend env | grep VITE_API_TARGET
```

**Test API connectivity from container:**
```bash
docker exec ifm-frontend wget -O- http://your-api-server:8080/api/health
```

### Image size concerns

**Check image size:**
```bash
docker images ifm-project-mgmt-web
```

**Analyze image layers:**
```bash
docker history ifm-project-mgmt-web:latest
```

## Production Deployment

### Best Practices

1. **Use specific tags**: Avoid using `latest` in production
   ```bash
   docker build -t ifm-project-mgmt-web:1.0.0 .
   ```

2. **Set resource limits**:
   ```bash
   docker run -d \
     -p 3000:3000 \
     --memory="512m" \
     --cpus="0.5" \
     ifm-project-mgmt-web:1.0.0
   ```

3. **Use read-only filesystem** (distroless supports this):
   ```bash
   docker run -d \
     -p 3000:3000 \
     --read-only \
     --tmpfs /tmp \
     ifm-project-mgmt-web:1.0.0
   ```

4. **Run as non-root user**: Distroless images already run as non-root by default

### Security Scanning

Scan the image for vulnerabilities:

```bash
# Using Docker Scout
docker scout cves ifm-project-mgmt-web:latest

# Using Trivy
trivy image ifm-project-mgmt-web:latest
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t ifm-project-mgmt-web:${{ github.sha }} .

      - name: Push to registry
        run: |
          docker tag ifm-project-mgmt-web:${{ github.sha }} registry.example.com/ifm-project-mgmt-web:latest
          docker push registry.example.com/ifm-project-mgmt-web:latest
```

## Accessing the Application

Once the container is running, access the application at:
- **Local**: http://localhost:3000
- **Docker host**: http://<docker-host-ip>:3000

## Cleaning Up

**Stop and remove container:**
```bash
docker stop ifm-frontend
docker rm ifm-frontend
```

**Remove image:**
```bash
docker rmi ifm-project-mgmt-web:latest
```

**Clean up all unused resources:**
```bash
docker system prune -a
```
