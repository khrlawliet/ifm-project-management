/**
 * TaskFilters Component
 * Reusable filter panel for tasks
 * Combines ProjectFilter, PriorityFilter, StatusFilter, and date filters
 */

import { Grid } from '@mui/material';
import type { Dayjs } from 'dayjs';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { Project } from '../../types';
import ProjectFilter from './ProjectFilter';
import PriorityFilter from './PriorityFilter';
import StatusFilter from './StatusFilter';
import DueDateRangeFilter from './DueDateRangeFilter';
import DateRangeSelector from './DateRangeSelector';

interface TaskFiltersProps {
  // Project Filter
  selectedProject: number | '';
  projects: Project[];
  onProjectChange: (e: SelectChangeEvent) => void;

  // Priority Filter
  selectedPriority: number | '';
  onPriorityChange: (e: SelectChangeEvent) => void;

  // Status Filter
  selectedStatus?: string;
  onStatusChange?: (e: SelectChangeEvent) => void;

  // Date Filters (for Task List view with date pickers)
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
  onStartDateChange?: (date: Dayjs | null) => void;
  onEndDateChange?: (date: Dayjs | null) => void;

  // Date Range Selector (for Calendar view with dropdown)
  dateFilter?: string;
  onDateFilterChange?: (e: SelectChangeEvent) => void;

  // Configuration
  showDateRangePicker?: boolean; // Show date pickers (Task List)
  showDateRangeSelector?: boolean; // Show date range dropdown (Calendar)
  showStatusFilter?: boolean; // Show status filter (Task List)
}

/**
 * TaskFilters - A unified filter panel for task views
 *
 * This component provides a consistent filter interface across different views:
 * - Task List: Shows project, priority, status, and date range (with date pickers)
 * - Calendar: Shows project, priority, and date range (with dropdown selector)
 *
 * Benefits:
 * - DRY: Eliminates duplicated filter UI code
 * - Consistency: Ensures filters look and behave the same across views
 * - Maintainability: Changes to filters only need to be made in one place
 *
 * @param props - Filter configuration and handlers
 */
const TaskFilters = ({
  selectedProject,
  projects,
  onProjectChange,
  selectedPriority,
  onPriorityChange,
  selectedStatus,
  onStatusChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  dateFilter,
  onDateFilterChange,
  showDateRangePicker = true,
  showDateRangeSelector = false,
  showStatusFilter = false,
}: TaskFiltersProps) => {
  return (
    <Grid container spacing={2}>
      {/* Project Filter */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <ProjectFilter
          selectedProject={selectedProject}
          projects={projects}
          onChange={onProjectChange}
        />
      </Grid>

      {/* Priority Filter */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <PriorityFilter
          selectedPriority={selectedPriority}
          onChange={onPriorityChange}
        />
      </Grid>

      {/* Status Filter */}
      {showStatusFilter && selectedStatus !== undefined && onStatusChange && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatusFilter
            selectedStatus={selectedStatus}
            onChange={onStatusChange}
          />
        </Grid>
      )}

      {/* Date Range Filter - Date Pickers (Task List) */}
      {showDateRangePicker && onStartDateChange && onEndDateChange && (
        <Grid size={{ xs: 12, sm: 12, md: showStatusFilter ? 3 : 4 }}>
          <DueDateRangeFilter
            startDate={startDate ?? null}
            endDate={endDate ?? null}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />
        </Grid>
      )}

      {/* Date Range Filter - Selector (Calendar) */}
      {showDateRangeSelector && dateFilter && onDateFilterChange && (
        <Grid size={{ xs: 12, sm: 12, md: showStatusFilter ? 3 : 4 }}>
          <DateRangeSelector
            dateFilter={dateFilter}
            onChange={onDateFilterChange}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default TaskFilters;
