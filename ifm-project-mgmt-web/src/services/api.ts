import axios from 'axios';
import type { Task, Project, User, PaginatedResponse, TaskFilters, CreateTaskRequest } from '../types';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskApi = {
  // Get all tasks across all projects with filters and pagination
  getAllTasks: async (filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> => {
    const params = new URLSearchParams();

    if (filters.projectId) params.append('projectId', filters.projectId.toString());
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());

    const response = await apiClient.get<PaginatedResponse<Task>>('/tasks', { params });
    return response.data;
  },

  // Get tasks for a specific project with filters and pagination
  getTasks: async (projectId: number, filters: Omit<TaskFilters, 'projectId'> = {}): Promise<PaginatedResponse<Task>> => {
    const params = new URLSearchParams();

    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());

    const response = await apiClient.get<PaginatedResponse<Task>>(`/projects/${projectId}/tasks`, { params });
    return response.data;
  },

  // Get task by ID
  getTaskById: async (id: number): Promise<Task> => {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  // Create a new task
  createTask: async (task: CreateTaskRequest): Promise<Task> => {
    const { projectId, ...taskData } = task;
    const response = await apiClient.post<Task>(`/projects/${projectId}/tasks`, taskData);
    return response.data;
  },

  // Update task status
  updateTaskStatus: async (id: number, status: string): Promise<Task> => {
    const response = await apiClient.patch<Task>(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // Update task
  updateTask: async (id: number, task: Partial<Task>): Promise<Task> => {
    const response = await apiClient.put<Task>(`/tasks/${id}`, task);
    return response.data;
  },

  // Delete task
  deleteTask: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};

export const projectApi = {
  // Get all projects
  getProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects');
    return response.data;
  },

  // Get project by ID
  getProjectById: async (id: number): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  // Create a new project
  createProject: async (project: Omit<Project, 'id'>): Promise<Project> => {
    const response = await apiClient.post<Project>('/projects', project);
    return response.data;
  },

  // Update project
  updateProject: async (id: number, project: Partial<Omit<Project, 'id'>>): Promise<Project> => {
    const response = await apiClient.put<Project>(`/projects/${id}`, project);
    return response.data;
  },

  // Delete project
  deleteProject: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};

export const userApi = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  // Search users by username or email
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/search', {
      params: { q: query },
    });
    return response.data;
  },
};

export default apiClient;
