/**
 * ProjectFilter Component
 * Reusable dropdown for filtering by project
 */

import { FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { Project } from '../../types';
import { FILTER_LABELS } from '../../constants/taskConstants';

interface ProjectFilterProps {
  selectedProject: number | '';
  projects: Project[];
  onChange: (e: SelectChangeEvent) => void;
  helperText?: string;
}

/**
 * ProjectFilter - A dropdown component for selecting a project
 *
 * @param selectedProject - Currently selected project ID (empty string for "All Projects")
 * @param projects - Array of available projects
 * @param onChange - Callback function when selection changes
 * @param helperText - Optional helper text displayed below the dropdown
 */
const ProjectFilter = ({
  selectedProject,
  projects,
  onChange,
  helperText = 'Which project\'s tasks to show',
}: ProjectFilterProps) => {
  /**
   * Render the selected value in the dropdown
   * Shows "All Projects" when nothing is selected, otherwise shows project name
   */
  const renderValue = (selected: string | number): string => {
    if (!selected || selected === '') {
      return FILTER_LABELS.ALL_PROJECTS;
    }
    const project = projects.find(p => p.id === Number(selected));
    return project ? project.name : FILTER_LABELS.ALL_PROJECTS;
  };

  return (
    <>
      <FormControl fullWidth>
        <InputLabel shrink>Project</InputLabel>
        <Select
          value={selectedProject.toString()}
          onChange={onChange}
          label="Project"
          displayEmpty
          notched
          renderValue={renderValue}
        >
          <MenuItem value="">{FILTER_LABELS.ALL_PROJECTS}</MenuItem>
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </>
  );
};

export default ProjectFilter;
