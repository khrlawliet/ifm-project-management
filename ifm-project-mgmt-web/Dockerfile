# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy all project files
COPY . .

# Build argument for API target (optional, defaults to localhost:8080)
ARG VITE_API_TARGET=http://localhost:8080
ENV VITE_API_TARGET=${VITE_API_TARGET}

# Build the application
RUN npm run build

# Stage 2: Install production dependencies
FROM node:20-alpine AS prod-deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts

# Stage 3: Production image with distroless
FROM gcr.io/distroless/nodejs20-debian12

# Set working directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy production dependencies from prod-deps stage
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy package.json and serve configuration
COPY --from=builder /app/package.json ./
COPY --from=builder /app/serve.json ./

# Use non-root user (distroless default)
USER nonroot

# Expose port
EXPOSE 3000

# Use serve to serve static files with configuration
CMD ["node_modules/serve/build/main.js", "-c", "serve.json", "-l", "3000"]
