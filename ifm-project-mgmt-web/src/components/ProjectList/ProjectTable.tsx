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

interface ProjectTableProps {
  projects: Project[];
  loading: boolean;
  searchQuery: string;
  onEdit: (project: Project) => void;
  onDelete: (projectId: number) => void;
}

const ProjectTable = ({
  projects,
  loading,
  searchQuery,
  onEdit,
  onDelete,
}: ProjectTableProps) => {
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
            if (projects.length === 0) {
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
            return projects.map((project) => (
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
