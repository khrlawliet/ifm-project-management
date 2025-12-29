/**
 * ProjectTable Component
 * Reusable table for displaying projects list
 */

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Project } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { useProjectContext } from '../../contexts/ProjectContext';

interface ProjectTableProps {
  onEdit: (project: Project) => void;
  onDelete: (projectId: number) => void;
}

const ProjectTable = ({
  onEdit,
  onDelete,
}: ProjectTableProps) => {
  const { filteredProjects, loading, searchQuery } = useProjectContext();
  return (
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
          {(() => {
            if (loading) {
              return (
                <TableRow>
                  <TableCell colSpan={3}>
                    <LoadingSpinner message="Loading projects..." />
                  </TableCell>
                </TableRow>
              );
            }
            if (filteredProjects.length === 0) {
              return (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery
                        ? 'No projects found matching your search.'
                        : 'No projects found. Create your first project to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            }
            return filteredProjects.map((project) => (
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
                    onClick={() => onEdit(project)}
                    title="Edit project"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(project.id)}
                    title="Delete project"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ));
          })()}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProjectTable;
