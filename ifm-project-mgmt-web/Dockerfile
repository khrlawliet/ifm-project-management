# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove package-lock.json and install dependencies fresh
# This fixes Rollup optional dependency issues in Docker
RUN rm -f package-lock.json && npm install

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
