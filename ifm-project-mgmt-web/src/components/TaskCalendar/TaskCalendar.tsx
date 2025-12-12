/**
 * TaskCalendar Component (Refactored)
 *
 * This component displays tasks in a calendar view with visual indicators for task severity.
 *
 * Key improvements:
 * - Uses reusable filter components instead of duplicating code
 * - Uses utility functions for color calculations and date operations
 * - Uses constants instead of magic strings
 * - Uses custom hook for filter management
 * - Follows Single Responsibility Principle
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

// API and Types
import { taskApi, projectApi } from '../../services/api';
import type { Task, Project } from '../../types';

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
  filterTasksByPriority,
  filterTasksByStatus,
  getTaskCountsByPriority,
} from '../../utils/taskUtils';
import {
  PAGINATION,
  SORT_BY,
  DATE_FILTER,
  FILTER_LABELS,
  COLORS,
  TASK_PRIORITY,
} from '../../constants/taskConstants';

// Custom Hook
import { useTaskFilters } from '../../hooks/useTaskFilters';

interface TaskCalendarProps {
  refresh?: number;
}

/**
 * TaskCalendar Component
 *
 * Displays tasks on a calendar with:
 * - Project, priority, status, and date range filters
 * - Visual indicators (colors) for task status severity
 * - Multiple small badges per day, one for each priority level
 * - Each badge shows count and color-coded by priority
 * - Detailed task list for selected date
 */
const TaskCalendar = ({ refresh }: TaskCalendarProps) => {
  // ============================================
  // State Management
  // ============================================

  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state (using custom hook)
  const {
    selectedProject,
    priorityFilter,
    statusFilter,
    dateFilter,
    handleProjectChange,
    handlePriorityFilterChange,
    handleStatusFilterChange,
    handleDateFilterChange,
  } = useTaskFilters();

  // Task detail dialog state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ============================================
  // Effects
  // ============================================

  /**
   * Load projects on component mount
   */
  useEffect(() => {
    loadProjects();
  }, []);

  /**
   * Load tasks when filters or date change
   */
  useEffect(() => {
    loadTasksForMonth();
  }, [selectedDate, selectedProject, dateFilter, priorityFilter, statusFilter, refresh]);

  // ============================================
  // Data Loading Functions
  // ============================================

  /**
   * Load all available projects from API
   */
  const loadProjects = async () => {
    try {
      const data = await projectApi.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  /**
   * Load tasks for the current month/week from API
   */
  const loadTasksForMonth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine date range based on dateFilter
      let startDate: string;
      let endDate: string;
      const today = dayjs();

      switch (dateFilter) {
        case DATE_FILTER.THIS_WEEK:
          // Get tasks for this week (Sunday to Saturday)
          startDate = today.startOf('week').format('YYYY-MM-DD');
          endDate = today.endOf('week').format('YYYY-MM-DD');
          break;

        case DATE_FILTER.NEXT_WEEK:
          // Get tasks for next week (Sunday to Saturday)
          const nextWeek = today.add(1, 'week');
          startDate = nextWeek.startOf('week').format('YYYY-MM-DD');
          endDate = nextWeek.endOf('week').format('YYYY-MM-DD');
          break;

        case DATE_FILTER.NEXT_MONTH:
          // Get tasks for next month
          const nextMonth = today.add(1, 'month');
          startDate = nextMonth.startOf('month').format('YYYY-MM-DD');
          endDate = nextMonth.endOf('month').format('YYYY-MM-DD');
          break;

        default:
          // Get tasks for the entire current month
          startDate = selectedDate.startOf('month').format('YYYY-MM-DD');
          endDate = selectedDate.endOf('month').format('YYYY-MM-DD');
          break;
      }

      let response;

      // Use project-specific endpoint if project is selected
      if (selectedProject) {
        response = await taskApi.getTasks(Number(selectedProject), {
          startDate,
          endDate,
          sortBy: SORT_BY.DUE_DATE,
          size: PAGINATION.CALENDAR_PAGE_SIZE,
        });
      } else {
        // Use general endpoint for all projects
        response = await taskApi.getAllTasks({
          startDate,
          endDate,
          sortBy: SORT_BY.DUE_DATE,
          size: PAGINATION.CALENDAR_PAGE_SIZE,
        });
      }

      // Apply client-side filters
      let filteredTasks = filterTasksByPriority(response.content, priorityFilter);
      filteredTasks = filterTasksByStatus(filteredTasks, statusFilter);

      setTasks(filteredTasks);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Event Handlers
  // ============================================

  /**
   * Handle calendar date change
   */
  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  /**
   * Open task detail dialog
   */
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  /**
   * Close task detail dialog
   */
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTask(null);
  };

  // ============================================
  // Helper Functions
  // ============================================

  /**
   * Get background color for a calendar date based on task severity
   */
  const getDateBackgroundColor = (date: Dayjs): string | null => {
    const severity = getDateSeverity(tasks, date);
    return getSeverityColor(severity);
  };

  /**
   * Get sorted tasks for the selected date
   */
  const getTasksForSelectedDate = (): Task[] => {
    const dateTasks = getTasksForDate(tasks, selectedDate);
    return sortTasksByPriority(dateTasks);
  };

  // ============================================
  // Calendar Day Component
  // ============================================

  /**
   * Custom day component for the calendar
   * Shows colored background and multiple small badges for each priority level
   */
  const ServerDay = (props: PickersDayProps<Dayjs>) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const backgroundColor = getDateBackgroundColor(day);
    const taskCountsByPriority = getTaskCountsByPriority(tasks, day);
    const hasTasks = Object.keys(taskCountsByPriority).length > 0;

    // Don't apply custom styling for days outside current month
    if (outsideCurrentMonth) {
      return <PickersDay {...props} />;
    }

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
                ? `${backgroundColor}dd` // Slightly darker on hover
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
          Object.entries(taskCountsByPriority)
            .sort(([a], [b]) => Number(a) - Number(b)) // Sort by priority (1-5)
            .map(([priority, count], index) => {
              // Position badges along the curve at top-right
              // Positions follow the circular arc from right to top
              const curvePositions = [
                { top: 3, right: 2 },      // First: far right
                { top: 2, right: 6 },      // Second: mid-right
                { top: 4, right: 10 },     // Third: center
                { top: 8, right: 13 },     // Fourth: mid-left
                { top: 13, right: 15 },    // Fifth: far left
              ];

              const position = curvePositions[index] || curvePositions[0];

              return (
                <Box
                  key={priority}
                  sx={{
                    position: 'absolute',
                    ...position,
                    backgroundColor: COLORS.PRIORITY_BADGE[Number(priority)],
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
  };

  // ============================================
  // Main Render
  // ============================================

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
        <TaskFilters
          selectedProject={selectedProject}
          projects={projects}
          onProjectChange={handleProjectChange}
          selectedPriority={priorityFilter}
          onPriorityChange={handlePriorityFilterChange}
          selectedStatus={statusFilter}
          onStatusChange={handleStatusFilterChange}
          dateFilter={dateFilter}
          onDateFilterChange={handleDateFilterChange}
          showDateRangePicker={false}
          showDateRangeSelector={true}
          showStatusFilter={true}
        />

        {/* Active Filters Summary */}
        <Box mt={2} sx={{ p: 1.5, bgcolor: COLORS.UI.ACTIVE_FILTER_BG, borderRadius: 1, border: '1px solid', borderColor: COLORS.UI.ACTIVE_FILTER_BORDER }}>
          <Typography variant="body2" fontWeight="medium" component="div">
            Active Filters:
            <Chip
              label={`Project: ${selectedProject ? projects.find(p => p.id === Number(selectedProject))?.name || 'Selected Project' : FILTER_LABELS.ALL_PROJECTS}`}
              size="small"
              sx={{ ml: 1, mr: 1 }}
            />
            <Chip
              label={`Priority: ${priorityFilter ? priorityFilter : FILTER_LABELS.ALL_PRIORITIES}`}
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip
              label={`Status: ${statusFilter ? statusFilter : FILTER_LABELS.ALL_STATUSES}`}
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip
              label={
                dateFilter === DATE_FILTER.THIS_WEEK ? FILTER_LABELS.THIS_WEEK :
                dateFilter === DATE_FILTER.NEXT_WEEK ? FILTER_LABELS.NEXT_WEEK :
                dateFilter === DATE_FILTER.NEXT_MONTH ? FILTER_LABELS.NEXT_MONTH :
                FILTER_LABELS.CURRENT_MONTH
              }
              size="small"
              color="primary"
              sx={{ mr: 1 }}
            />
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Calendar */}
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={selectedDate}
              onChange={handleDateChange}
              loading={loading}
              slots={{
                day: ServerDay,
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
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Tasks on {selectedDate.format('MMMM DD, YYYY')}
          </Typography>

          {loading ? (
            <LoadingSpinner message="Loading tasks..." />
          ) : tasksOnSelectedDate.length === 0 ? (
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
          ) : (
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
          )}
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

export default TaskCalendar;
