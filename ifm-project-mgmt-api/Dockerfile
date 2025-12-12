# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy pom.xml and download dependencies (for better caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application (skip tests for faster builds, run them separately in CI/CD)
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime with distroless image
FROM gcr.io/distroless/java21-debian12:nonroot

WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Run as non-root user (distroless nonroot image runs as user 65532)
USER nonroot

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
