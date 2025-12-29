/**
 * ProjectContext - Manages project list state and search
 */
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { projectApi } from '../services/api';
import type { Project } from '../types';
import { useAppContext } from './AppContext';

interface ProjectContextState {
  // Data
  projects: Project[];
  filteredProjects: Project[];
  loading: boolean;
  error: string | null;

  // Search
  searchQuery: string;

  // Actions
  loadProjects: () => Promise<void>;
  handleSearchChange: (value: string) => void;
  deleteProject: (projectId: number) => Promise<void>;
  setError: (error: string | null) => void;
}

const ProjectContext = createContext<ProjectContextState | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
  onProjectChanged?: () => void;
}

export const ProjectProvider = ({ children, onProjectChanged }: ProjectProviderProps) => {
  // Get shared projects from AppContext
  const { projects, projectsLoading, refreshProjects } = useAppContext();

  // Local state
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Alias for consistency with existing code
  const loading = projectsLoading;
  const loadProjects = refreshProjects;

  // Filter projects based on search query (derived state using useMemo)
  const filteredProjects = useMemo(() => {
    if (searchQuery.trim() === '') {
      return projects;
    }
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        (project.description?.toLowerCase().includes(query) ?? false)
    );
  }, [projects, searchQuery]);

  // Action handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const deleteProject = useCallback(async (projectId: number) => {
    try {
      await projectApi.deleteProject(projectId);
      await loadProjects();
      if (onProjectChanged) {
        onProjectChanged();
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete project');
    }
  }, [loadProjects, onProjectChanged]);

  const value: ProjectContextState = useMemo(() => ({
    projects,
    filteredProjects,
    loading,
    error,
    searchQuery,
    loadProjects,
    handleSearchChange,
    deleteProject,
    setError,
  }), [projects, filteredProjects, loading, error, searchQuery, loadProjects, handleSearchChange, deleteProject]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};
