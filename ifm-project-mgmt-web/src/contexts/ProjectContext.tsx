/**
 * ProjectContext - Manages project list state and search
 */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { projectApi } from '../services/api';
import type { Project } from '../types';

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
  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Load projects from API
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectApi.getProjects();
      setProjects(data);
      setFilteredProjects(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Filter projects when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredProjects(
        projects.filter(
          (project) =>
            project.name.toLowerCase().includes(query) ||
            (project.description?.toLowerCase().includes(query) ?? false)
        )
      );
    }
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
