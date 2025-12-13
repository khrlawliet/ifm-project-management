/**
 * Task Utility Functions
 * Reusable functions for task-related calculations and logic
 */

import dayjs, { Dayjs } from 'dayjs';
import type { Task } from '../types';
import {
  TASK_STATUS,
  TASK_PRIORITY,
  COLORS,
  DATE_THRESHOLDS,
  SEVERITY_LEVEL,
} from '../constants/taskConstants';

/**
 * Calculate the number of days between today and a given date
 * @param dueDate - The due date to compare
 * @returns Number of days (negative if overdue)
 */
export const calculateDaysUntilDue = (dueDate: string | Dayjs): number => {
  const today = dayjs().startOf('day');
  const due = dayjs(dueDate).startOf('day');
  return due.diff(today, 'day');
};

/**
 * Check if a task is overdue
 * @param task - The task to check
 * @returns True if the task is overdue
 */
export const isTaskOverdue = (task: Task): boolean => {
  if (task.status === TASK_STATUS.COMPLETED) {
    return false;
  }
  return calculateDaysUntilDue(task.dueDate) < DATE_THRESHOLDS.OVERDUE_DAYS;
};

/**
 * Check if a task is due soon
 * @param task - The task to check
 * @returns True if the task is due within the threshold
 */
export const isTaskDueSoon = (task: Task): boolean => {
  if (task.status === TASK_STATUS.COMPLETED) {
    return false;
  }
  const daysUntilDue = calculateDaysUntilDue(task.dueDate);
  return daysUntilDue >= DATE_THRESHOLDS.OVERDUE_DAYS && daysUntilDue <= DATE_THRESHOLDS.DUE_SOON_DAYS;
};

/**
 * Get the appropriate color for a task priority chip
 * @param priority - The task priority (1-5)
 * @returns MUI color variant
 */
export const getPriorityColor = (priority: number): 'error' | 'warning' | 'info' | 'success' => {
  if (priority === TASK_PRIORITY.HIGHEST) return 'error';
  if (priority === TASK_PRIORITY.HIGH) return 'warning';
  if (priority <= TASK_PRIORITY.MEDIUM) return 'info';
  return 'success';
};

/**
 * Get the badge color for a task priority (same colors as calendar badge)
 * Priority 1 = Red, 2 = Orange, 3 = Yellow, 4 = Blue, 5 = Green
 * @param priority - The task priority (1-5)
 * @returns Hex color string
 */
export const getPriorityBadgeColor = (priority: number): string => {
  return COLORS.PRIORITY_BADGE[priority as keyof typeof COLORS.PRIORITY_BADGE] || COLORS.PRIORITY_BADGE[TASK_PRIORITY.LOWEST];
};

/**
 * Get the appropriate color for a task status chip
 * @param status - The task status
 * @returns MUI color variant
 */
export const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'warning' => {
  if (status === TASK_STATUS.COMPLETED) return 'success';
  if (status === TASK_STATUS.IN_PROGRESS) return 'primary';
  if (status === TASK_STATUS.PENDING) return 'warning';
  return 'default';
};

/**
 * Get the background color for a task's due date cell
 * @param task - The task
 * @returns Hex color string
 */
export const getDueDateBackgroundColor = (task: Task): string => {
  // If task is completed, always show green
  if (task.status === TASK_STATUS.COMPLETED) {
    return COLORS.DUE_DATE_BG.COMPLETED;
  }

  const daysUntilDue = calculateDaysUntilDue(task.dueDate);

  // For IN_PROGRESS or PENDING tasks
  if (daysUntilDue < DATE_THRESHOLDS.OVERDUE_DAYS) {
    return COLORS.DUE_DATE_BG.OVERDUE;
  } else if (daysUntilDue <= DATE_THRESHOLDS.DUE_SOON_DAYS) {
    return COLORS.DUE_DATE_BG.DUE_SOON;
  } else {
    return COLORS.DUE_DATE_BG.UPCOMING;
  }
};

/**
 * Get the text color for a task's due date cell
 * @param task - The task
 * @returns Hex color string
 */
export const getDueDateTextColor = (task: Task): string => {
  // If task is completed, always show green text
  if (task.status === TASK_STATUS.COMPLETED) {
    return COLORS.DUE_DATE_TEXT.COMPLETED;
  }

  const daysUntilDue = calculateDaysUntilDue(task.dueDate);

  // For IN_PROGRESS or PENDING tasks
  if (daysUntilDue < DATE_THRESHOLDS.OVERDUE_DAYS) {
    return COLORS.DUE_DATE_TEXT.OVERDUE;
  } else if (daysUntilDue <= DATE_THRESHOLDS.DUE_SOON_DAYS) {
    return COLORS.DUE_DATE_TEXT.DUE_SOON;
  } else {
    return COLORS.DUE_DATE_TEXT.UPCOMING;
  }
};

/**
 * Get the severity level for a single task (used for calendar coloring)
 * Based on task status with priority order:
 * 1. PENDING (orange) - Highest priority
 * 2. IN_PROGRESS (green) - Medium priority
 * 3. COMPLETED (blue) - Lowest priority
 *
 * @param task - The task
 * @returns Severity level (1-3)
 */
export const getTaskSeverity = (task: Task): number => {
  // Return severity based on status
  switch (task.status) {
    case TASK_STATUS.PENDING:
      return SEVERITY_LEVEL.PENDING; // Highest priority - orange
    case TASK_STATUS.IN_PROGRESS:
      return SEVERITY_LEVEL.IN_PROGRESS; // Medium priority - green
    case TASK_STATUS.COMPLETED:
      return SEVERITY_LEVEL.COMPLETED; // Lowest priority - blue
    default:
      return SEVERITY_LEVEL.NONE;
  }
};

/**
 * Get the highest severity level among tasks on a specific date
 * @param tasks - Array of tasks
 * @param date - The date to check
 * @returns Highest severity level (0-4)
 */
export const getDateSeverity = (tasks: Task[], date: Dayjs): number => {
  const dateTasks = tasks.filter((task) => dayjs(task.dueDate).isSame(date, 'day'));

  if (dateTasks.length === 0) return SEVERITY_LEVEL.NONE;

  // Find the maximum severity among all tasks on this date
  return Math.max(...dateTasks.map(getTaskSeverity));
};

/**
 * Get the color for a date based on its severity level
 * @param severity - The severity level
 * @returns Hex color string or null
 */
export const getSeverityColor = (severity: number): string | null => {
  switch (severity) {
    case SEVERITY_LEVEL.PENDING:
      return COLORS.SEVERITY.PENDING; // Orange
    case SEVERITY_LEVEL.IN_PROGRESS:
      return COLORS.SEVERITY.IN_PROGRESS; // Green
    case SEVERITY_LEVEL.COMPLETED:
      return COLORS.SEVERITY.COMPLETED; // Blue
    default:
      return null;
  }
};

/**
 * Get the highest priority (lowest number) among tasks on a specific date
 * @param tasks - Array of tasks
 * @param date - The date to check
 * @returns Priority number (1-5) or 0 if no tasks
 */
export const getHighestPriorityOnDate = (tasks: Task[], date: Dayjs): number => {
  const dateTasks = tasks.filter((task) => dayjs(task.dueDate).isSame(date, 'day'));

  if (dateTasks.length === 0) return 0;

  // Find the highest priority (lowest number)
  return Math.min(...dateTasks.map(task => task.priority));
};

/**
 * Convert priority to severity (for badge coloring)
 * Priority 1 (highest) -> Severity 5 (red)
 * Priority 5 (lowest) -> Severity 1 (blue)
 * @param priority - The priority level (1-5)
 * @returns Severity level (1-5)
 */
export const priorityToSeverity = (priority: number): number => {
  return 6 - priority;
};

/**
 * Get badge color based on severity level (1-5)
 * @param severity - Severity level (1-5)
 * @returns Hex color string
 */
export const getBadgeColorFromSeverity = (severity: number): string => {
  const severityMap: Record<number, string> = {
    5: COLORS.PRIORITY_BADGE[TASK_PRIORITY.HIGHEST],
    4: COLORS.PRIORITY_BADGE[TASK_PRIORITY.HIGH],
    3: COLORS.PRIORITY_BADGE[TASK_PRIORITY.MEDIUM],
    2: COLORS.PRIORITY_BADGE[TASK_PRIORITY.LOW],
    1: COLORS.PRIORITY_BADGE[TASK_PRIORITY.LOWEST],
  };

  return severityMap[severity] || COLORS.PRIORITY_BADGE[TASK_PRIORITY.LOWEST];
};

/**
 * Sort tasks by priority (highest first)
 * @param tasks - Array of tasks to sort
 * @returns Sorted array of tasks
 */
export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => a.priority - b.priority);
};

/**
 * Filter tasks by priority
 * @param tasks - Array of tasks to filter
 * @param priority - Priority to filter by (empty string for all)
 * @returns Filtered array of tasks
 */
export const filterTasksByPriority = (tasks: Task[], priority: number | ''): Task[] => {
  if (!priority) return tasks;
  return tasks.filter(task => task.priority === Number(priority));
};

/**
 * Get tasks for a specific date
 * @param tasks - Array of all tasks
 * @param date - The date to filter by
 * @returns Array of tasks on that date
 */
export const getTasksForDate = (tasks: Task[], date: Dayjs): Task[] => {
  return tasks.filter((task) => dayjs(task.dueDate).isSame(date, 'day'));
};

/**
 * Filter tasks by status
 * @param tasks - Array of tasks to filter
 * @param status - Status to filter by (empty string for all)
 * @returns Filtered array of tasks
 */
export const filterTasksByStatus = (tasks: Task[], status: string): Task[] => {
  if (!status) return tasks;
  return tasks.filter(task => task.status === status);
};

/**
 * Get task counts grouped by priority for a specific date
 * @param tasks - Array of all tasks
 * @param date - The date to check
 * @returns Record of priority to count
 */
export const getTaskCountsByPriority = (tasks: Task[], date: Dayjs): Record<number, number> => {
  const dateTasks = tasks.filter((task) => dayjs(task.dueDate).isSame(date, 'day'));
  const counts: Record<number, number> = {};

  dateTasks.forEach(task => {
    counts[task.priority] = (counts[task.priority] || 0) + 1;
  });

  return counts;
};
