/**
 * DateRangeSelector Component
 * Reusable component for selecting date range (Calendar-specific)
 */

import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { DATE_FILTER, FILTER_LABELS } from '../../constants/taskConstants';

interface DateRangeSelectorProps {
  dateFilter: string;
  onChange: (e: SelectChangeEvent) => void;
  helperText?: string;
}

/**
 * DateRangeSelector - A component for selecting between current month and this week
 *
 * @param dateFilter - Currently selected date filter ('all' or 'thisWeek')
 * @param onChange - Callback function when selection changes
 * @param helperText - Optional helper text displayed below the selector
 */
const DateRangeSelector = ({
  dateFilter,
  onChange,
  helperText = 'Which date range to display',
}: DateRangeSelectorProps) => {
  return (
    <>
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
        <Typography variant="subtitle2" fontWeight="medium" mb={2}>
          Due Date
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel shrink>Date Range</InputLabel>
          <Select
            value={dateFilter}
            onChange={onChange}
            label="Date Range"
            displayEmpty
            notched
          >
            <MenuItem value={DATE_FILTER.ALL}>{FILTER_LABELS.CURRENT_MONTH}</MenuItem>
            <MenuItem value={DATE_FILTER.THIS_WEEK}>{FILTER_LABELS.THIS_WEEK}</MenuItem>
            <MenuItem value={DATE_FILTER.NEXT_WEEK}>{FILTER_LABELS.NEXT_WEEK}</MenuItem>
            <MenuItem value={DATE_FILTER.NEXT_MONTH}>{FILTER_LABELS.NEXT_MONTH}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </>
  );
};

export default DateRangeSelector;
