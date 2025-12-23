/**
 * Task-related constants
 * This file contains all magic strings and numbers used throughout the task management system
 */

// Task Status Constants
export const TASK_STATUS = {
  COMPLETED: 'COMPLETED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING: 'PENDING',
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

// Task Priority Constants
export const TASK_PRIORITY = {
  HIGHEST: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
  LOWEST: 5,
} as const;

export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];

// Priority Labels
export const PRIORITY_LABELS = {
  [TASK_PRIORITY.HIGHEST]: '1 (Highest)',
  [TASK_PRIORITY.HIGH]: '2',
  [TASK_PRIORITY.MEDIUM]: '3',
  [TASK_PRIORITY.LOW]: '4',
  [TASK_PRIORITY.LOWEST]: '5 (Lowest)',
} as const;

// Color Constants
export const COLORS = {
  // Status Colors
  STATUS: {
    SUCCESS: '#4caf50',
    WARNING: '#ff9800',
    ERROR: '#f44336',
    INFO: '#2196f3',
  },

  // Due Date Background Colors
  DUE_DATE_BG: {
    COMPLETED: '#e8f5e9',
    OVERDUE: '#ffebee',
    DUE_SOON: '#fff3e0',
    UPCOMING: '#e3f2fd',
  },

  // Due Date Text Colors
  DUE_DATE_TEXT: {
    COMPLETED: '#2e7d32',
    OVERDUE: '#c62828',
    DUE_SOON: '#e65100',
    UPCOMING: '#1565c0',
  },

  // Severity Colors (for calendar date backgrounds - based on task status)
  SEVERITY: {
    PENDING: '#ff9800',      // Orange - Highest priority
    IN_PROGRESS: '#42a5f5',  // Blue - Medium priority
    COMPLETED: '#66bb6a',    // Green - Lowest priority
  },

  // Priority Badge Colors
  PRIORITY_BADGE: {
    [TASK_PRIORITY.HIGHEST]: '#f44336',
    [TASK_PRIORITY.HIGH]: '#ff9800',
    [TASK_PRIORITY.MEDIUM]: '#ffeb3b',
    [TASK_PRIORITY.LOW]: '#2196f3',
    [TASK_PRIORITY.LOWEST]: '#4caf50',
  },

  // UI Colors
  UI: {
    BORDER: '#e0e0e0',
    TODAY_BG: '#e0e0e0',
    TODAY_BORDER: '#9e9e9e',
    ACTIVE_FILTER_BG: '#e3f2fd',
    ACTIVE_FILTER_BORDER: '#90caf9',
  },
} as const;

// Date Filter Constants
export const DATE_FILTER = {
  ALL: 'all',
  THIS_WEEK: 'thisWeek',
  NEXT_WEEK: 'nextWeek',
  NEXT_MONTH: 'nextMonth',
} as const;

export type DateFilterType = typeof DATE_FILTER[keyof typeof DATE_FILTER];

// Sort By Constants
export const SORT_BY = {
  DUE_DATE: 'dueDate',
  PRIORITY: 'priority',
} as const;

export type SortByType = typeof SORT_BY[keyof typeof SORT_BY];

// Date Thresholds
export const DATE_THRESHOLDS = {
  OVERDUE_DAYS: 0,
  DUE_SOON_DAYS: 2,
} as const;

// Severity Levels (used for calendar date coloring based on status)
// Higher number = higher priority for display
export const SEVERITY_LEVEL = {
  NONE: 0,
  COMPLETED: 1,      // Blue - Lowest priority
  IN_PROGRESS: 2,    // Green - Medium priority
  PENDING: 3,        // Orange - Highest priority
} as const;

// Filter Labels
export const FILTER_LABELS = {
  ALL_PROJECTS: 'All',
  ALL_PRIORITIES: 'All',
  ALL_STATUSES: 'All',
  CURRENT_MONTH: 'Current Month',
  THIS_WEEK: 'This Week',
  NEXT_WEEK: 'Next Week',
  NEXT_MONTH: 'Next Month',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_ROWS_PER_PAGE: 10,
  ROWS_PER_PAGE_OPTIONS: [5, 10, 25, 50],
  CALENDAR_PAGE_SIZE: 100,
} as const;

export const PRIORITY_BADGE_POSITION = {
  [TASK_PRIORITY.HIGHEST]: { top: 3, right: 2 },
  [TASK_PRIORITY.HIGH]:    { top: 12, right: -2 },
  [TASK_PRIORITY.MEDIUM]:  { top: 22, right: -1 },
  [TASK_PRIORITY.LOW]:     { top: 28, right: 7 },
  [TASK_PRIORITY.LOWEST]:  { top: 30, right: 17 }
} as const;

export const DEFAULT_POSITION = { top: 3, right: 2 };