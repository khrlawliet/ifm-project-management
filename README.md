# IFM Project Management System

Full-stack project management application with task tracking, calendar views, and priority management.

## What It Does

- Create and manage projects
- Add tasks with priorities (High, Medium, Low)
- Track task status (Pending, In Progress, Completed)
- View tasks in calendar or list format
- Filter tasks by date range and project
- Sort tasks by priority or due date

## Tech Stack

**Backend:** Java 21, Spring Boot, H2 Database
**Frontend:** React 19, TypeScript, Material-UI, Vite

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Start both API and Web
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Access:**
- Web App: http://localhost:3000
- API: http://localhost:8080
- API Docs: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console

### Option 2: Local Development

**Prerequisites:**
- Java 21+
- Maven 3.6+
- Node.js 20+

**Run with Script:**

Linux/Mac:
```bash
./start.sh
```

Windows:
```bash
start.bat
```

The script will:
- Install frontend dependencies (if needed)
- Start the backend API on http://localhost:8080
- Start the frontend web on http://localhost:3000

**Manual Start:**

Backend:
```bash
cd ifm-project-mgmt-api
mvn spring-boot:run
```

Frontend:
```bash
cd ifm-project-mgmt-web
npm install
npm run dev
```

## Project Structure

```
ifm/
├── ifm-project-mgmt-api/      # Spring Boot API
├── ifm-project-mgmt-web/      # React Frontend
├── docker-compose.yml         # Docker setup
├── start.sh                   # Linux/Mac startup script
└── start.bat                  # Windows startup script
```

## API Endpoints

**Projects:**
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project

**Tasks:**
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/projects/{id}/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

**Query Parameters:**
- `startDate` - Filter start date (YYYY-MM-DD)
- `endDate` - Filter end date (YYYY-MM-DD)
- `sortBy` - Sort by `priority` or `dueDate`
- `order` - `asc` or `desc`

## Database

H2 in-memory database (resets on restart). Access console at http://localhost:8080/h2-console

**Connection:**
- JDBC URL: `jdbc:h2:mem:projectdb`
- Username: `sa`
- Password: (empty)

## Troubleshooting

**Port already in use:**
- API: Change port in `ifm-project-mgmt-api/src/main/resources/application.yml`
- Web: Change port in `ifm-project-mgmt-web/vite.config.ts`

**Docker build fails:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

**Script not executable (Linux/Mac):**
```bash
chmod +x start.sh
```

## More Info

- [API Documentation](ifm-project-mgmt-api/README.md)
- [Frontend Documentation](ifm-project-mgmt-web/README.md)
