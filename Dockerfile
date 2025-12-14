# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

# ⬇️ Set working directory to API module
WORKDIR /build/ifm-project-mgmt-api

# Copy pom.xml first for dependency caching
COPY ifm-project-mgmt-api/pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY ifm-project-mgmt-api/src ./src

# Build the application
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime (distroless)
FROM gcr.io/distroless/java21-debian12:nonroot

WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /build/ifm-project-mgmt-api/target/*.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

# Run as non-root user
USER nonroot

# Start the app
ENTRYPOINT ["java", "-jar", "app.jar"]
