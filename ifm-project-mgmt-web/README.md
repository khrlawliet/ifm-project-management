# IFM Project Management - Frontend

React TypeScript frontend for managing projects and tasks with calendar and list views.

## Features

- **Task Management** - Create, view, and filter tasks with priority and status tracking
- **Calendar View** - Visual calendar displaying tasks on their due dates
- **Task List** - Paginated table with filtering by project, date range, and sorting
- **Material-UI** - Modern, responsive interface

## Tech Stack

React 19 • TypeScript • Material-UI • Axios • Day.js • Vite

## Quick Start

**1. Install dependencies:**
```bash
npm install
```

**2. Start development server:**
```bash
npm run dev
```

**3. Open the app:**
- Frontend: http://localhost:3000
- Ensure backend is running on http://localhost:8080

## Backend Integration

The Vite dev server proxies `/api` requests to `http://localhost:8080` (configured in vite.config.ts) to avoid CORS issues.

**API Endpoints:**
- `GET /api/tasks` - Retrieve tasks with filters and pagination
- `POST /api/tasks` - Create a new task
- `GET /api/projects` - Retrieve all projects

## Project Structure

```
src/
├── components/
│   ├── TaskForm/         # Task creation form
│   ├── TaskList/         # Task list with pagination
│   ├── TaskCalendar/     # Calendar view
│   └── common/           # Reusable components
├── services/
│   └── api.ts            # API service layer
├── types/
│   └── index.ts          # TypeScript types
└── App.tsx               # Main component
```

## Available Commands

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Requirements

- Node.js v20.x or higher
- Backend API running on port 8080
