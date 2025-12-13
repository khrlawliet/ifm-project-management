export const TaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export interface Task {
  id?: number;
  name: string;
  priority: number; // 1-5
  dueDate: string;
  assignee: string;
  status: TaskStatus;
  projectId: number;
  projectName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface TaskFilters {
  projectId?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'priority' | 'dueDate';
  taskName?: string;
  page?: number;
  size?: number;
}

export interface CreateTaskRequest {
  name: string;
  priority: number;
  dueDate: string;
  assignee: string;
  projectId: number;
  status?: TaskStatus;
}
