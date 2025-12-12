# IFM Project Management Tool

RESTful API for managing projects and tasks with priority-based sorting, date filtering, and asynchronous notifications.

## Technology Stack

- Java 21
- Spring Boot 3.2.1
- Spring Data JPA
- H2 Database (in-memory)
- Maven
- Swagger UI (API documentation)

## Prerequisites

- Java 21
- Maven 3.6+
- Docker (optional)

## Quick Start

### Run with Maven

```bash
mvn clean install
mvn spring-boot:run
```

### Run with Docker

```bash
# Build image
docker build -t ifm-project-mgmt .

# Run container in detached mode
docker run -d --name ifm-project-mgmt -p 8080:8080 ifm-project-mgmt

# View logs
docker logs -f ifm-project-mgmt

# Stop container
docker stop ifm-project-mgmt

# Start container
docker start ifm-project-mgmt

# Remove container
docker rm -f ifm-project-mgmt
```

### Access Points

- **Application**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **H2 Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:projectdb`
  - Username: `sa`
  - Password: (empty)

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/{id}` - Get project by ID
- `POST /api/projects` - Create project

### Tasks
- `GET /api/tasks` - Get all tasks across all projects (supports filtering)
- `POST /api/projects/{projectId}/tasks` - Create task
- `GET /api/projects/{projectId}/tasks` - Get tasks for a specific project (supports filtering)
- `GET /api/tasks/{id}` - Get task by ID
- `PUT /api/tasks/{id}` - Update task
- `PATCH /api/tasks/{id}/status` - Update task status
- `DELETE /api/tasks/{id}` - Delete task

### Query Parameters
- `startDate` - Filter tasks by start date
- `endDate` - Filter tasks by end date
- `sortBy` - Sort by `priority` or `dueDate`
- `order` - `asc` or `desc`

## Example Usage

```bash
# Get all tasks (default view)
curl "http://localhost:8080/api/tasks?sortBy=dueDate&order=asc&page=0&size=10"

# Create a task
curl -X POST http://localhost:8080/api/projects/1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Design Database Schema",
    "priority": 2,
    "dueDate": "2025-12-14",
    "assignee": "john.doe@example.com"
  }'

# Get filtered tasks for a specific project
curl "http://localhost:8080/api/projects/1/tasks?startDate=2025-12-01&endDate=2025-12-31&sortBy=priority&order=asc"
```

## Testing

```bash
mvn test
```

## Configuration

Edit `src/main/resources/application.properties`:

```properties
server.port=8080
spring.datasource.url=jdbc:h2:mem:projectdb
spring.task.execution.pool.core-size=5
spring.task.execution.pool.max-size=10
```
