/**
 * AppContext - Global application state for shared data
 * Manages projects and users that are used across multiple components (ProjectList, TaskList, etc.)
 */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { projectApi, userApi } from '../services/api';
import type { Project, User } from '../types';

interface AppContextState {
  // Shared data
  projects: Project[];
  projectsLoading: boolean;
  projectsError: string | null;

  users: User[];
  usersLoading: boolean;
  usersError: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  loadUsers: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Load projects from API
  const loadProjects = useCallback(async () => {
    try {
      setProjectsLoading(true);
      setProjectsError(null);
      const data = await projectApi.getProjects();
      setProjects(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setProjectsError(error.response?.data?.message || 'Failed to load projects');
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  // Refresh projects (can be called when projects are updated)
  const refreshProjects = useCallback(async () => {
    try {
      const data = await projectApi.getProjects();
      setProjects(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setProjectsError(error.response?.data?.message || 'Failed to refresh projects');
    }
  }, []);

  // Load users from API
  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setUsersError(error.response?.data?.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Refresh users (can be called when users are updated)
  const refreshUsers = useCallback(async () => {
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setUsersError(error.response?.data?.message || 'Failed to refresh users');
    }
  }, []);

  // Load projects and users on mount
  useEffect(() => {
    loadProjects();
    loadUsers();
  }, [loadProjects, loadUsers]);

  const value: AppContextState = useMemo(
    () => ({
      projects,
      projectsLoading,
      projectsError,
      loadProjects,
      refreshProjects,
      users,
      usersLoading,
      usersError,
      loadUsers,
      refreshUsers,
    }),
    [
      projects,
      projectsLoading,
      projectsError,
      loadProjects,
      refreshProjects,
      users,
      usersLoading,
      usersError,
      loadUsers,
      refreshUsers,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
