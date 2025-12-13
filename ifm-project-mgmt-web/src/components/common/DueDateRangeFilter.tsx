/**
 * DueDateRangeFilter Component
 * Reusable component for filtering tasks by due date range
 */

import { Box, Typography, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';

interface DueDateRangeFilterProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onStartDateChange: (date: Dayjs | null) => void;
  onEndDateChange: (date: Dayjs | null) => void;
  helperText?: string;
}

/**
 * DueDateRangeFilter - A component for selecting a date range for task filtering
 *
 * @param startDate - The start date of the range
 * @param endDate - The end date of the range
 * @param onStartDateChange - Callback when start date changes
 * @param onEndDateChange - Callback when end date changes
 * @param helperText - Optional helper text displayed below the filter
 */
const DueDateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  helperText = 'Filter tasks by due date range',
}: DueDateRangeFilterProps) => {
  return (
    <>
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
        <Typography variant="subtitle2" fontWeight="medium" mb={2}>
          Due Date
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date From"
                value={startDate}
                onChange={onStartDateChange}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date To"
                value={endDate}
                onChange={onEndDateChange}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Box>
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </>
  );
};

export default DueDateRangeFilter;
