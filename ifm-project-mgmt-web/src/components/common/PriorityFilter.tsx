/**
 * PriorityFilter Component
 * Reusable dropdown for filtering by task priority
 */

import { FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { TASK_PRIORITY, PRIORITY_LABELS, FILTER_LABELS } from '../../constants/taskConstants';

interface PriorityFilterProps {
  selectedPriority: number | '';
  onChange: (e: SelectChangeEvent) => void;
  helperText?: string;
}

/**
 * PriorityFilter - A dropdown component for selecting task priority
 *
 * @param selectedPriority - Currently selected priority (empty string for "All Priorities")
 * @param onChange - Callback function when selection changes
 * @param helperText - Optional helper text displayed below the dropdown
 */
const PriorityFilter = ({
  selectedPriority,
  onChange,
  helperText = 'Filter by specific priority level',
}: PriorityFilterProps) => {
  /**
   * Render the selected value in the dropdown
   * Shows "All Priorities" when nothing is selected, otherwise shows priority level
   */
  const renderValue = (selected: string | number): string => {
    if (!selected || selected === '') {
      return FILTER_LABELS.ALL_PRIORITIES;
    }
    return `Priority ${selected}`;
  };

  // Get all priority values (1-5)
  const priorityValues = Object.values(TASK_PRIORITY);

  return (
    <>
      <FormControl fullWidth>
        <InputLabel shrink>Priority</InputLabel>
        <Select
          value={selectedPriority.toString()}
          onChange={onChange}
          label="Priority"
          displayEmpty
          notched
          renderValue={renderValue}
        >
          <MenuItem value="">{FILTER_LABELS.ALL_PRIORITIES}</MenuItem>
          {priorityValues.map((priority) => (
            <MenuItem key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
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

export default PriorityFilter;
