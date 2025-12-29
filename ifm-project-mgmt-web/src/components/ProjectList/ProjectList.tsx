/**
 * ProjectList Component (Refactored - Modular Components)
 *
 * This component displays a list of projects with search and CRUD operations.
 *
 * Architecture:
 * - Uses Context only for shared project data fetching
 * - Dialog/form state managed locally in this component
 * - Table and Dialog extracted into separate reusable components
 * - Clean separation of concerns
 */

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';

// Contexts
import { ProjectProvider, useProjectContext } from '../../contexts/ProjectContext';

// API
import { projectApi } from '../../services/api';

// Types
import type { Project } from '../../types';

// Components
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmDialog from '../common/ConfirmDialog';
import ProjectTable from './ProjectTable';
import ProjectDialog from './ProjectDialog';

interface ProjectListProps {
  onProjectChanged?: () => void;
}

interface ProjectFormData {
  name: string;
  description: string;
}

/**
 * ProjectList Content Component
 * Contains the actual UI logic with local dialog state
 */
const ProjectListContent = () => {
  // Access project context (shared data only)
  const {
    filteredProjects,
    loading,
    error,
    searchQuery,
    loadProjects,
    handleSearchChange,
    deleteProject,
  } = useProjectContext();

  // Local dialog state (UI-only, no need for context)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Success notification state
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Confirm delete dialog state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Dialog actions
  const openCreateDialog = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingProject(null);
    setFormError(null);
  };

  const handleFormChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async () => {
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
      await loadProjects();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || `Failed to ${editingProject ? 'update' : 'create'} project`);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = (projectId: number) => {
    const project = filteredProjects.find(p => p.id === projectId);
    if (project) {
      setProjectToDelete(project);
      setConfirmDeleteOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete !== null) {
      await deleteProject(projectToDelete.id);
      setConfirmDeleteOpen(false);
      setProjectToDelete(null);
      setSuccessMessage(`Project "${projectToDelete.name}" deleted successfully!`);
      setSuccessOpen(true);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setProjectToDelete(null);
  };

  // Render loading state
  if (loading && filteredProjects.length === 0) {
    return <LoadingSpinner message="Loading projects..." />;
  }

  return (
    <>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Projects</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            Create Project
          </Button>
        </Box>

        {/* Search Box */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* Error Message */}
        {error && <ErrorMessage message={error} onRetry={loadProjects} />}

        {/* Project Table */}
        <ProjectTable
          onEdit={openEditDialog}
          onDelete={handleDeleteClick}
        />
      </Paper>

      {/* Create/Edit Project Dialog */}
      <ProjectDialog
        open={dialogOpen}
        editingProject={editingProject}
        formData={formData}
        formError={formError}
        formLoading={formLoading}
        onClose={closeDialog}
        onFormChange={handleFormChange}
        onSubmit={handleFormSubmit}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Success Notification */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

/**
 * ProjectList Component with Context Provider
 * Only wraps with ProjectContext for shared project data
 */
const ProjectList = ({ onProjectChanged }: ProjectListProps) => {
  return (
    <ProjectProvider onProjectChanged={onProjectChanged}>
      <ProjectListContent />
    </ProjectProvider>
  );
};

export default ProjectList;
