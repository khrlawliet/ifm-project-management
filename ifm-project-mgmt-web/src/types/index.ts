export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

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
  page?: number;
  size?: number;
}

export interface CreateTaskRequest {
  name: string;
  priority: number;
  dueDate: string;
  assignee: string;
  projectId: number;
  status?: string;
}
