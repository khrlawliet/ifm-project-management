/**
 * ProjectDialog Component
 * Reusable dialog for creating and editing projects
 */

import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import type { Project } from '../../types';

interface ProjectFormData {
  name: string;
  description: string;
}

interface ProjectDialogProps {
  open: boolean;
  editingProject: Project | null;
  formData: ProjectFormData;
  formError: string | null;
  formLoading: boolean;
  onClose: () => void;
  onFormChange: (name: string, value: string) => void;
  onSubmit: () => void;
}

const ProjectDialog = ({
  open,
  editingProject,
  formData,
  formError,
  formLoading,
  onClose,
  onFormChange,
  onSubmit,
}: ProjectDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
            onChange={(e) => onFormChange(e.target.name, e.target.value)}
            disabled={formLoading}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => onFormChange(e.target.name, e.target.value)}
            disabled={formLoading}
            multiline
            rows={4}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={formLoading}
          color="error"
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          color="primary"
          disabled={formLoading || !formData.name}
        >
          {(() => {
            if (formLoading) return 'Saving...';
            return editingProject ? 'Update' : 'Create';
          })()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDialog;
