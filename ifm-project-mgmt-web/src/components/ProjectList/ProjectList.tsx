import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { projectApi } from '../../services/api';
import type { Project } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface ProjectListProps {
  onProjectChanged?: () => void;
}

const ProjectList = ({ onProjectChanged }: ProjectListProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Project dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    // Filter projects based on search query
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredProjects(
        projects.filter(
          (project) =>
            project.name.toLowerCase().includes(query) ||
            (project.description && project.description.toLowerCase().includes(query))
        )
      );
    }
  }, [projects, searchQuery]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectApi.getProjects();
      setProjects(data);
      setFilteredProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleOpenCreateDialog = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProject(null);
    setFormError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setFormLoading(true);
    setFormError(null);

    try {
      if (editingProject) {
        // Update existing project
        await projectApi.updateProject(editingProject.id, formData);
      } else {
        // Create new project
        await projectApi.createProject(formData);
      }
      handleCloseDialog();
      loadProjects();
      if (onProjectChanged) {
        onProjectChanged();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || `Failed to ${editingProject ? 'update' : 'create'} project`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (projectId: number) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      return;
    }

    try {
      await projectApi.deleteProject(projectId);
      loadProjects();
      if (onProjectChanged) {
        onProjectChanged();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading && projects.length === 0) {
    return <LoadingSpinner message="Loading projects..." />;
  }

  return (
    <>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Projects</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
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
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && <ErrorMessage message={error} onRetry={loadProjects} />}

        {/* Project Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <LoadingSpinner message="Loading projects..." />
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery ? 'No projects found matching your search.' : 'No projects found. Create your first project to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {project.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {project.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditDialog(project)}
                        title="Edit project"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(project.id)}
                        title="Delete project"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create/Edit Project Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        <DialogContent>
          {formError && (
            <Box mb={2}>
              <Typography color="error">{formError}</Typography>
            </Box>
          )}
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              fullWidth
              required
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              disabled={formLoading}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              disabled={formLoading}
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={formLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={formLoading || !formData.name}
          >
            {formLoading ? 'Saving...' : editingProject ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectList;
