/**
 * StatusFilter Component
 * Reusable component for filtering tasks by status
 */

import { FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { TASK_STATUS, FILTER_LABELS } from '../../constants/taskConstants';

interface StatusFilterProps {
  selectedStatus: string;
  onChange: (e: SelectChangeEvent) => void;
  helperText?: string;
}

/**
 * StatusFilter - A reusable status dropdown filter
 *
 * @param selectedStatus - Currently selected status (empty string for 'All Statuses')
 * @param onChange - Callback function when selection changes
 * @param helperText - Optional helper text displayed below the filter
 */
const StatusFilter = ({
  selectedStatus,
  onChange,
  helperText = 'Which status to show',
}: StatusFilterProps) => {
  const renderValue = (selected: string): string => {
    if (!selected || selected === '') {
      return FILTER_LABELS.ALL_STATUSES;
    }
    return selected;
  };

  return (
    <>
      <FormControl fullWidth>
        <InputLabel shrink>Status</InputLabel>
        <Select
          value={selectedStatus}
          onChange={onChange}
          label="Status"
          displayEmpty
          notched
          renderValue={renderValue}
        >
          <MenuItem value="">{FILTER_LABELS.ALL_STATUSES}</MenuItem>
          <MenuItem value={TASK_STATUS.PENDING}>{TASK_STATUS.PENDING}</MenuItem>
          <MenuItem value={TASK_STATUS.IN_PROGRESS}>{TASK_STATUS.IN_PROGRESS}</MenuItem>
          <MenuItem value={TASK_STATUS.COMPLETED}>{TASK_STATUS.COMPLETED}</MenuItem>
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

export default StatusFilter;
