# IFM Project Management - Frontend

React TypeScript frontend for project and task management.

## Features

- Project and task management interface
- Calendar view with color-coded priorities
- List view with filtering and sorting
- Date range filtering
- Priority levels (High, Medium, Low)
- Status tracking (Pending, In Progress, Completed)
- Responsive Material-UI design

## Tech Stack

- React 19
- TypeScript
- Material-UI (MUI)
- Vite
- Axios
- Day.js

## Quick Start

### Run Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

**Access:** http://localhost:3000

**Requirements:** Backend API must be running on http://localhost:8080

### Run with Docker

```bash
# Build
docker build -t ifm-web .

# Run
docker run -p 3000:3000 ifm-web
```

### Run with Docker Compose

```bash
# From project root
docker-compose up web
```

## API Integration

Vite proxies `/api` requests to the backend (configured in `vite.config.ts`):

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

## Project Structure

```
src/
├── components/
│   ├── ProjectList/          # Project management (CRUD)
│   ├── TaskList/             # Task list with filters and CRUD dialogs
│   ├── TaskCalendar/         # Calendar view
│   └── common/               # Shared components
│       ├── LoadingSpinner.tsx
│       ├── ErrorMessage.tsx
│       ├── TaskFilters.tsx
│       ├── ProjectFilter.tsx
│       ├── PriorityFilter.tsx
│       ├── StatusFilter.tsx
│       ├── TaskChips.tsx
│       ├── DateRangeSelector.tsx
│       └── DueDateRangeFilter.tsx
├── services/
│   └── api.ts                # API calls
├── types/
│   └── index.ts              # TypeScript types
├── utils/
│   └── taskUtils.ts          # Utility functions
├── hooks/
│   └── useTaskFilters.ts     # Custom filter hook
├── constants/
│   └── taskConstants.ts      # Constants and enums
├── App.tsx                   # Main app with tab navigation
└── main.tsx                  # Entry point
```

## Components

### ProjectList
- View all projects in a table
- Create new projects with dialog
- Edit existing projects
- Delete projects with confirmation
- Search/filter projects
- Success notifications

### TaskList
- Paginated table view
- Create/Edit/Delete tasks via dialog
- Filter by project, priority, status, date range
- Sort by priority or due date
- User autocomplete for assignee
- Color-coded due dates (overdue, due soon, upcoming)
- Success notifications

### TaskCalendar
- Monthly calendar view with date range selector
- Color-coded dates by task status (Pending, In Progress, Completed)
- Multiple priority badges per day (Red=1, Orange=2, Yellow=3, Blue=4, Green=5)
- Click date to view tasks
- Task detail dialog
- Filter by project, priority, status
- Visual legend explaining colors

## Available Scripts

```bash
npm run dev        # Start dev server (port 3000)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Build for Production

```bash
npm run build
```

Output in `dist/` folder. Deploy to any static hosting.

## Environment Variables

Create `.env.local`:

```env
VITE_API_TARGET=http://localhost:8080
```

## Troubleshooting

**Port 3000 in use:**
Edit `vite.config.ts`:
```typescript
server: { port: 3001 }
```

**API connection errors:**
- Ensure backend is running on port 8080
- Check proxy config in `vite.config.ts`

**Build errors:**
```bash
rm -rf node_modules dist
npm install
npm run build
```
