# IFM Project Management API

Spring Boot REST API for managing projects and tasks.

## Features

- Project and task CRUD operations
- Priority-based sorting (High, Medium, Low)
- Date range filtering
- Status tracking (Pending, In Progress, Completed)
- H2 in-memory database with Flyway migrations
- Swagger API documentation

## Tech Stack

- Java 21
- Spring Boot 3.2.1
- Spring Data JPA
- H2 Database
- Flyway
- Maven
- Swagger/OpenAPI

## Quick Start

### Run Locally

```bash
# Build and run
mvn clean install
mvn spring-boot:run
```

**Access:**
- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console

### Run with Docker

```bash
# Build
docker build -t ifm-api .

# Run
docker run -p 8080:8080 ifm-api
```

### Run with Docker Compose

```bash
# From project root
docker-compose up api
```

## API Endpoints

### Projects

```http
GET    /api/projects           # List all projects
GET    /api/projects/{id}      # Get project by ID
POST   /api/projects           # Create project
PUT    /api/projects/{id}      # Update project
DELETE /api/projects/{id}      # Delete project and all its tasks
```

**Create Project:**
```json
POST /api/projects
{
  "name": "Website Redesign",
  "description": "Complete redesign"
}
```

**Update Project:**
```json
PUT /api/projects/1
{
  "name": "Website Redesign v2",
  "description": "Updated redesign with new requirements"
}
```

### Tasks

```http
GET    /api/tasks                      # Get all tasks (with filters)
GET    /api/projects/{id}/tasks        # Get tasks by project
GET    /api/tasks/{id}                 # Get task by ID
POST   /api/projects/{id}/tasks        # Create task
PUT    /api/tasks/{id}                 # Update task
PATCH  /api/tasks/{id}/status          # Update status
DELETE /api/tasks/{id}                 # Delete task
```

**Create Task:**
```json
POST /api/projects/1/tasks
{
  "name": "Design Database Schema",
  "description": "Create ER diagram",
  "priority": 1,
  "status": "PENDING",
  "dueDate": "2025-12-31",
  "assignee": "john.doe@example.com"
}
```

**Update Task:**
```json
PUT /api/tasks/1
{
  "name": "Updated Task Name",
  "description": "Updated description",
  "priority": 2,
  "status": "IN_PROGRESS",
  "dueDate": "2025-12-25",
  "assignee": "jane.doe@example.com"
}
```

**Update Task Status:**
```json
PATCH /api/tasks/1/status
{
  "status": "COMPLETED"
}
```

**Filter All Tasks:**
```bash
GET /api/tasks?status=IN_PROGRESS&startDate=2025-12-01&endDate=2025-12-31&sortBy=priority&order=asc&page=0&size=20
```

**Filter Project Tasks:**
```bash
GET /api/projects/1/tasks?startDate=2025-12-01&endDate=2025-12-31&sortBy=dueDate&order=desc&page=0&size=20
```

**Query Parameters:**
- `status` - Filter by status: `PENDING`, `IN_PROGRESS`, or `COMPLETED` (for `/api/tasks` only)
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)
- `sortBy` - Sort by `priority` or `dueDate` (default: `dueDate`)
- `order` - `asc` or `desc` (default: `asc`)
- `page` - Page number (default: 0)
- `size` - Page size (default: 20)

**Priority Levels:**
- `1` = High
- `2` = Medium
- `3` = Low

**Status Values:**
- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`

### Users

```http
GET    /api/users              # Get all users
GET    /api/users/search       # Search users by username or email
```

**Get All Users:**
```bash
GET /api/users
```

**Search Users:**
```bash
GET /api/users/search?q=john
```

**Query Parameters:**
- `q` - Search query to match username or email (optional)

## Database

H2 in-memory database. Access at http://localhost:8080/h2-console

**Connection:**
- JDBC URL: `jdbc:h2:mem:projectdb`
- Username: `sa`
- Password: (empty)

## Configuration

Edit `src/main/resources/application.yml`:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:h2:mem:projectdb
    username: sa
    password:
```

## Testing

```bash
mvn test
```

## Build

```bash
# Build JAR
mvn clean package

# Run JAR
java -jar target/ifm-project-mgmt-1.0.0.jar
```

## Project Structure

```
src/main/java/com/ifm/projectmgmt/
├── Application.java          # Main class
├── config/                   # Configuration
├── controller/               # REST controllers
├── dto/                      # Data Transfer Objects
├── entity/                   # JPA entities
├── exception/                # Exception handling
├── repository/               # JPA repositories
├── service/                  # Business logic
└── util/                     # Utilities

src/main/resources/
├── application.yml           # Configuration
└── db/migration/             # Flyway SQL scripts
```

## Swagger UI

Interactive API docs available at http://localhost:8080/swagger-ui.html

Test all endpoints directly in the browser.
