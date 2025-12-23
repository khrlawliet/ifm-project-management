/**
 * ProjectDialogContext - Manages project dialog and form state
 */
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { projectApi } from '../services/api';
import type { Project } from '../types';

interface ProjectFormData {
  name: string;
  description: string;
}

interface ProjectDialogContextState {
  // Dialog state
  dialogOpen: boolean;
  editingProject: Project | null;

  // Form state
  formData: ProjectFormData;
  formError: string | null;
  formLoading: boolean;

  // Success notification state
  successOpen: boolean;
  successMessage: string;

  // Actions
  openCreateDialog: () => void;
  openEditDialog: (project: Project) => void;
  closeDialog: () => void;
  handleFormChange: (name: string, value: string) => void;
  submitForm: (onSuccess: () => void) => Promise<void>;
  closeSuccess: () => void;
}

const ProjectDialogContext = createContext<ProjectDialogContextState | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useProjectDialogContext = () => {
  const context = useContext(ProjectDialogContext);
  if (!context) {
    throw new Error('useProjectDialogContext must be used within ProjectDialogProvider');
  }
  return context;
};

interface ProjectDialogProviderProps {
  children: ReactNode;
}

export const ProjectDialogProvider = ({ children }: ProjectDialogProviderProps) => {
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Success notification state
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Actions
  const openCreateDialog = useCallback(() => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
    });
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
    });
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingProject(null);
    setFormError(null);
  }, []);

  const handleFormChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const submitForm = useCallback(async (onSuccess: () => void) => {
    setFormLoading(true);
    setFormError(null);

    try {
      if (editingProject) {
        await projectApi.updateProject(editingProject.id, formData);
        setSuccessMessage('Project updated successfully!');
      } else {
        await projectApi.createProject(formData);
        setSuccessMessage('Project created successfully!');
      }

      closeDialog();
      setSuccessOpen(true);
      onSuccess();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || `Failed to ${editingProject ? 'update' : 'create'} project`);
    } finally {
      setFormLoading(false);
    }
  }, [editingProject, formData, closeDialog]);

  const closeSuccess = useCallback(() => {
    setSuccessOpen(false);
  }, []);

  const value: ProjectDialogContextState = useMemo(() => ({
    dialogOpen,
    editingProject,
    formData,
    formError,
    formLoading,
    successOpen,
    successMessage,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleFormChange,
    submitForm,
    closeSuccess,
  }), [
    dialogOpen,
    editingProject,
    formData,
    formError,
    formLoading,
    successOpen,
    successMessage,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleFormChange,
    submitForm,
    closeSuccess,
  ]);

  return <ProjectDialogContext.Provider value={value}>{children}</ProjectDialogContext.Provider>;
};
