/**
 * TaskCalendar Component (Refactored with Context)
 *
 * This component displays tasks in a calendar view with visual indicators for task severity.
 *
 * Key improvements:
 * - Uses React Context for state management (cleaner, more maintainable)
 * - Separation of concerns with TaskCalendarContext
 * - Reduced component complexity and improved readability
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

// Contexts
import { TaskCalendarProvider, useTaskCalendarContext } from '../../contexts/TaskCalendarContext';

// Types
import type { Task } from '../../types';

// Reusable Components
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import TaskFilters from '../common/TaskFilters';
import { PriorityChip, StatusChip } from '../common/TaskChips';

// Utilities and Constants
import {
  getDateSeverity,
  getSeverityColor,
  getDueDateBackgroundColor,
  getDueDateTextColor,
  getTasksForDate,
  sortTasksByPriority,
  getTaskCountsByPriority,
} from '../../utils/taskUtils';
import {
  SORT_BY,
  DATE_FILTER,
  FILTER_LABELS,
  COLORS,
  PRIORITY_BADGE_POSITION,
  DEFAULT_POSITION
} from '../../constants/taskConstants';

interface TaskCalendarProps {
  refresh?: number;
}

/**
 * Custom day component for the calendar
 */
interface ServerDayProps extends PickersDayProps {
  tasks: Task[];
  getDateBackgroundColor: (date: Dayjs) => string | null;
}

const ServerDay = React.memo<ServerDayProps>(({ tasks, getDateBackgroundColor, day, outsideCurrentMonth, ...other }: ServerDayProps) => {
  const backgroundColor = getDateBackgroundColor(day);
  const taskCountsByPriority = getTaskCountsByPriority(tasks, day);
  const hasTasks = Object.keys(taskCountsByPriority).length > 0;

  if (outsideCurrentMonth) {
    return <PickersDay {...other} day={day} outsideCurrentMonth={outsideCurrentMonth} />;
  }

  const entries = Object.entries(taskCountsByPriority)
    .sort(([a], [b]) => Number(a) - Number(b));

  const isSingleItem = entries.length === 1;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        sx={{
          backgroundColor: backgroundColor || 'transparent',
          color: backgroundColor ? '#fff' : 'inherit',
          fontWeight: backgroundColor ? 'bold' : 'normal',
          '&:hover': {
            backgroundColor: backgroundColor
              ? `${backgroundColor}dd`
              : 'rgba(0, 0, 0, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: backgroundColor
              ? `${backgroundColor}!important`
              : undefined,
            color: backgroundColor ? '#fff!important' : undefined,
          },
        }}
      />
      {hasTasks &&
       entries.map(([priorityId, count]) => {
          const id = Number(priorityId);
          
          const position = isSingleItem
            ? DEFAULT_POSITION 
            : (PRIORITY_BADGE_POSITION[id as keyof typeof PRIORITY_BADGE_POSITION] || DEFAULT_POSITION);

            return (
              <Box
                key={priorityId}
                sx={{
                  position: 'absolute',
                  ...position,
                  backgroundColor: COLORS.PRIORITY_BADGE[Number(priorityId) as keyof typeof COLORS.PRIORITY_BADGE],
                  color: '#fff',
                  borderRadius: '50%',
                  width: '10px',
                  height: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '7px',
                  fontWeight: 'bold',
                  border: '0.5px solid white',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  zIndex: 1,
                }}
              >
                {count}
              </Box>
            );
          })
      }
    </Box>
  );
});

ServerDay.displayName = 'ServerDay';

/**
 * TaskCalendar Content Component
 * Contains the actual UI logic, separated from provider
 */
const TaskCalendarContent = () => {
  // Access calendar context
  const {
    tasks,
    projects,
    loading,
    error,
    selectedDate,
    selectedProject,
    priorityFilter,
    statusFilter,
    dateFilter,
    sortBy,
    loadTasksForMonth,
    handleDateChange,
    handleProjectChange,
    handlePriorityFilterChange,
    handleStatusFilterChange,
    handleDateFilterChange,
    handleSortChange,
  } = useTaskCalendarContext();

  // Local state for task detail dialog
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Wrapper functions to match component interfaces
  const handleProjectChangeWrapper = (e: SelectChangeEvent) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    handleProjectChange(value);
  };

  const handlePriorityFilterChangeWrapper = (e: SelectChangeEvent) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    handlePriorityFilterChange(value);
  };

  const handleStatusFilterChangeWrapper = (e: SelectChangeEvent) => {
    handleStatusFilterChange(e.target.value);
  };

  const handleDateFilterChangeWrapper = (e: SelectChangeEvent) => {
    handleDateFilterChange(e.target.value);
  };

  // Dialog handlers
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTask(null);
  };

  // Helper functions
  const getDateBackgroundColor = (date: Dayjs): string | null => {
    const severity = getDateSeverity(tasks, date);
    return getSeverityColor(severity);
  };

  const getTasksForSelectedDate = (): Task[] => {
    const dateTasks = getTasksForDate(tasks, selectedDate);
    return sortTasksByPriority(dateTasks);
  };

  const tasksOnSelectedDate = getTasksForSelectedDate();

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h5" gutterBottom>
        Calendar View
      </Typography>

      {/* Error Message */}
      {error && <ErrorMessage message={error} onRetry={loadTasksForMonth} />}

      {/* Filters */}
      <Box mb={3}>
        {/* First Row: Project, Priority, Status */}
        <TaskFilters
          selectedProject={selectedProject}
          projects={projects}
          onProjectChange={handleProjectChangeWrapper}
          selectedPriority={priorityFilter}
          onPriorityChange={handlePriorityFilterChangeWrapper}
          selectedStatus={statusFilter}
          onStatusChange={handleStatusFilterChangeWrapper}
          showDateRangePicker={false}
          showDateRangeSelector={false}
          showStatusFilter={true}
        />

        {/* Second Row: Date Range and Sort By */}
        <Grid container spacing={2} mt={1}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle2" fontWeight="medium" mb={2}>
                Due Date
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Date Range</InputLabel>
                <Select
                  value={dateFilter}
                  onChange={handleDateFilterChangeWrapper}
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
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Which date range to display
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'priority' || value === 'dueDate') {
                    handleSortChange(value);
                  }
                }}
                label="Sort By"
              >
                <MenuItem value={SORT_BY.DUE_DATE}>Due Date</MenuItem>
                <MenuItem value={SORT_BY.PRIORITY}>Priority</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Sort tasks by due date or priority
            </Typography>
          </Grid>
        </Grid>

        {/* Active Filters Summary */}
        <Box mt={2} sx={{ p: 1.5, bgcolor: COLORS.UI.ACTIVE_FILTER_BG, borderRadius: 1, border: '1px solid', borderColor: COLORS.UI.ACTIVE_FILTER_BORDER }}>
          <Typography variant="body2" fontWeight="medium" component="div">
            Active Filters:
            <Chip
              label={`Project: ${
                selectedProject
                  ? projects.find(p => p.id === Number(selectedProject))?.name || 'Selected Project'
                  : FILTER_LABELS.ALL_PROJECTS
              }`}
              size="small"
              sx={{ ml: 1, mr: 1 }}
            />
            <Chip
              label={`Priority: ${priorityFilter || FILTER_LABELS.ALL_PRIORITIES}`}
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip
              label={`Status: ${statusFilter || FILTER_LABELS.ALL_STATUSES}`}
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip
              label={(() => {
                if (dateFilter === DATE_FILTER.THIS_WEEK) return FILTER_LABELS.THIS_WEEK;
                if (dateFilter === DATE_FILTER.NEXT_WEEK) return FILTER_LABELS.NEXT_WEEK;
                if (dateFilter === DATE_FILTER.NEXT_MONTH) return FILTER_LABELS.NEXT_MONTH;
                return FILTER_LABELS.CURRENT_MONTH;
              })()}
              size="small"
              color="primary"
              sx={{ mr: 1 }}
            />
          </Typography>
        </Box>
      </Box>

      {/* Info Note */}
      <Box mb={2} sx={{ p: 1.5, bgcolor: '#f9bf6939', borderRadius: 1, border: '1px solid #90caf9' }}>
        <Typography variant="body2" color="text.secondary">
          Click a date to view assigned tasks
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Calendar */}
        <Grid size={{ xs: 12, md: 6 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={selectedDate}
              onChange={handleDateChange}
              loading={loading}
              slots={{
                day: ServerDay as unknown as React.ComponentType<PickersDayProps>,
              }}
              slotProps={{
                day: {
                  tasks,
                  getDateBackgroundColor,
                } as Partial<ServerDayProps>,
              }}
              sx={{
                width: '100%',
                '& .MuiPickersDay-root': {
                  position: 'relative',
                },
                '& .MuiBadge-badge': {
                  fontSize: '0.6rem',
                  height: '16px',
                  minWidth: '16px',
                  padding: '0 4px',
                },
                '& .MuiPickersDay-today': {
                  backgroundColor: `${COLORS.UI.TODAY_BG} !important`,
                  border: `1px solid ${COLORS.UI.TODAY_BORDER} !important`,
                  '&:not(.Mui-selected)': {
                    backgroundColor: `${COLORS.UI.TODAY_BG} !important`,
                  },
                  '&:hover': {
                    backgroundColor: '#d0d0d0 !important',
                  },
                },
              }}
            />
          </LocalizationProvider>

          {/* Task Count Info */}
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              {dateFilter === DATE_FILTER.THIS_WEEK && `Total tasks this week: ${tasks.length}`}
              {dateFilter === DATE_FILTER.NEXT_WEEK && `Total tasks next week: ${tasks.length}`}
              {dateFilter === DATE_FILTER.NEXT_MONTH && `Total tasks next month: ${tasks.length}`}
              {dateFilter === DATE_FILTER.ALL && `Total tasks in ${selectedDate.format('MMMM YYYY')}: ${tasks.length}`}
            </Typography>
            <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
              Tasks displayed by priority (highest first)
            </Typography>
          </Box>

          {/* Color Legend */}
          <Box mt={2} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
              Date Color Legend (Based on Task Status):
            </Typography>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, bgcolor: COLORS.SEVERITY.PENDING, borderRadius: 0.5 }} />
                <Typography variant="caption">Pending Tasks (Highest Priority)</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, bgcolor: COLORS.SEVERITY.IN_PROGRESS, borderRadius: 0.5 }} />
                <Typography variant="caption">In Progress Tasks</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, bgcolor: COLORS.SEVERITY.COMPLETED, borderRadius: 0.5 }} />
                <Typography variant="caption">Completed Tasks</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, bgcolor: COLORS.UI.TODAY_BG, borderRadius: 0.5, border: `1px solid ${COLORS.UI.TODAY_BORDER}` }} />
                <Typography variant="caption">Current Date (Today)</Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              *If multiple tasks exist on a date, color shows highest priority status (Pending &gt; In Progress &gt; Completed)
            </Typography>

            <Typography variant="caption" fontWeight="bold" display="block" mt={2} mb={1}>
              Badge Colors (Task Priority):
            </Typography>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, bgcolor: COLORS.PRIORITY_BADGE[1], borderRadius: '50%' }} />
                <Typography variant="caption">Priority 1 (Highest) - Red</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, bgcolor: COLORS.PRIORITY_BADGE[2], borderRadius: '50%' }} />
                <Typography variant="caption">Priority 2 - Orange</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, bgcolor: COLORS.PRIORITY_BADGE[3], borderRadius: '50%' }} />
                <Typography variant="caption">Priority 3 - Yellow</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, bgcolor: COLORS.PRIORITY_BADGE[4], borderRadius: '50%' }} />
                <Typography variant="caption">Priority 4 - Blue</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, bgcolor: COLORS.PRIORITY_BADGE[5], borderRadius: '50%' }} />
                <Typography variant="caption">Priority 5 (Lowest) - Green</Typography>
              </Box>
            </Box>

            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              *Multiple small badges appear on dates. Each badge shows the count of tasks for that priority level.
            </Typography>
          </Box>
        </Grid>

        {/* Tasks for selected date */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom>
            Tasks on {selectedDate.format('MMMM DD, YYYY')}
          </Typography>

          {(() => {
            if (loading) {
              return <LoadingSpinner message="Loading tasks..." />;
            }
            if (tasksOnSelectedDate.length === 0) {
              return (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  minHeight="200px"
                >
                  <Typography variant="body2" color="text.secondary">
                    No tasks scheduled for this date
                  </Typography>
                </Box>
              );
            }
            return (
            <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
              {tasksOnSelectedDate.map((task) => (
                <Card
                  key={task.id}
                  sx={{ mb: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={() => handleTaskClick(task)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                      <Typography variant="h6" component="div">
                        {task.name}
                      </Typography>
                      <PriorityChip priority={task.priority} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Project: {task.projectName || `Project ${task.projectId}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Assignee: {task.assignee}
                    </Typography>
                    <Box mt={1}>
                      <StatusChip status={task.status} />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
            );
          })()}
        </Grid>
      </Grid>

      {/* Task Detail Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedTask && (
          <>
            <DialogTitle>{selectedTask.name}</DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={2} mt={1}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Project
                  </Typography>
                  <Typography variant="body1">
                    {selectedTask.projectName || `Project ${selectedTask.projectId}`}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Assignee
                  </Typography>
                  <Typography variant="body1">{selectedTask.assignee}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Priority
                  </Typography>
                  <PriorityChip priority={selectedTask.priority} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <StatusChip status={selectedTask.status} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Due Date
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-block',
                      backgroundColor: getDueDateBackgroundColor(selectedTask),
                      color: getDueDateTextColor(selectedTask),
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontWeight: 'medium',
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'inherit' }}>
                      {dayjs(selectedTask.dueDate).format('MMMM DD, YYYY')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

/**
 * TaskCalendar Component with Context Provider
 */
const TaskCalendar = ({ refresh }: TaskCalendarProps) => {
  return (
    <TaskCalendarProvider refresh={refresh}>
      <TaskCalendarContent />
    </TaskCalendarProvider>
  );
};

export default TaskCalendar;
