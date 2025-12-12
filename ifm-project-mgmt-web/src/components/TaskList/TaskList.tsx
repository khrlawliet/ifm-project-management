/**
 * TaskList Component (Refactored)
 *
 * This component displays a paginated table of tasks with filtering capabilities.
 *
 * Key improvements:
 * - Uses reusable filter components instead of duplicating code
 * - Uses utility functions for color calculations
 * - Uses constants instead of magic strings
 * - Uses custom hook for filter management
 * - Follows Single Responsibility Principle
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

// API and Types
import { taskApi, projectApi } from '../../services/api';
import type { Task, TaskFilters, Project, CreateTaskRequest } from '../../types';

// Reusable Components
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import TaskFilters from '../common/TaskFilters';
import { PriorityChip, StatusChip } from '../common/TaskChips';

// Utilities and Constants
import {
  getDueDateBackgroundColor,
  getDueDateTextColor,
  filterTasksByPriority,
  filterTasksByStatus,
} from '../../utils/taskUtils';
import {
  PAGINATION,
  SORT_BY,
  TASK_PRIORITY,
  PRIORITY_LABELS,
  TASK_STATUS,
} from '../../constants/taskConstants';

// Custom Hook
import { useTaskFilters } from '../../hooks/useTaskFilters';

interface TaskListProps {
  onTaskChanged?: () => void;
}

/**
 * TaskList Component
 *
 * Displays a table of tasks with:
 * - Project, priority, status, and date range filters
 * - Pagination
 * - Create, edit, and delete functionality
 */
const TaskList = ({ onTaskChanged }: TaskListProps) => {
  // ============================================
  // State Management
  // ============================================

  // Task data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION.DEFAULT_ROWS_PER_PAGE);
  const [totalElements, setTotalElements] = useState(0);

  // Filter state (using custom hook)
  const {
    selectedProject,
    priorityFilter,
    statusFilter,
    startDate,
    endDate,
    handleProjectChange,
    handlePriorityFilterChange,
    handleStatusFilterChange,
    handleStartDateChange,
    handleEndDateChange,
  } = useTaskFilters();

  // API filter state (for backend calls)
  const [apiFilters, setApiFilters] = useState<TaskFilters>({
    sortBy: SORT_BY.DUE_DATE,
  });

  // Task creation/editing dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<CreateTaskRequest>({
    name: '',
    priority: TASK_PRIORITY.HIGHEST,
    dueDate: '',
    assignee: '',
    projectId: 0,
  });
  const [formDueDate, setFormDueDate] = useState<Dayjs | null>(dayjs().add(1, 'day'));
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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
   * Update API filters when project or dates change
   */
  useEffect(() => {
    setApiFilters({
      sortBy: SORT_BY.DUE_DATE,
      projectId: selectedProject ? Number(selectedProject) : undefined,
      startDate: startDate ? startDate.format('YYYY-MM-DD') : undefined,
      endDate: endDate ? endDate.format('YYYY-MM-DD') : undefined,
    });
    setPage(PAGINATION.DEFAULT_PAGE); // Reset to first page on filter change
  }, [selectedProject, startDate, endDate]);

  /**
   * Load tasks when filters or pagination change
   */
  useEffect(() => {
    loadTasks();
  }, [page, rowsPerPage, apiFilters, priorityFilter, statusFilter]);

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

      // Set first project as default for form
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, projectId: data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  /**
   * Load tasks from API with current filters and pagination
   */
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;

      // Use project-specific endpoint if project is selected
      if (apiFilters.projectId) {
        response = await taskApi.getTasks(apiFilters.projectId, {
          startDate: apiFilters.startDate,
          endDate: apiFilters.endDate,
          sortBy: apiFilters.sortBy,
          page,
          size: rowsPerPage,
        });
      } else {
        // Use general endpoint for all projects
        response = await taskApi.getAllTasks({
          ...apiFilters,
          page,
          size: rowsPerPage,
        });
      }

      // Apply client-side filters
      let filteredTasks = filterTasksByPriority(response.content, priorityFilter);
      filteredTasks = filterTasksByStatus(filteredTasks, statusFilter);

      setTasks(filteredTasks);
      setTotalElements((priorityFilter || statusFilter) ? filteredTasks.length : response.totalElements);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Event Handlers - Pagination
  // ============================================

  /**
   * Handle page change in pagination
   */
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /**
   * Handle rows per page change in pagination
   */
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(PAGINATION.DEFAULT_PAGE);
  };

  // ============================================
  // Event Handlers - Task Dialog
  // ============================================

  /**
   * Open dialog for creating a new task
   */
  const handleOpenCreateDialog = () => {
    setEditingTask(null);
    const defaultDueDate = dayjs().add(1, 'day');
    setFormData({
      name: '',
      priority: TASK_PRIORITY.HIGHEST,
      dueDate: defaultDueDate.format('YYYY-MM-DD'),
      assignee: '',
      projectId: projects.length > 0 ? projects[0].id : 0,
    });
    setFormDueDate(defaultDueDate);
    setFormError(null);
    setDialogOpen(true);
  };

  /**
   * Open dialog for editing an existing task
   */
  const handleOpenEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      priority: task.priority,
      dueDate: task.dueDate,
      assignee: task.assignee,
      projectId: task.projectId,
      status: task.status,
    });
    setFormDueDate(dayjs(task.dueDate));
    setFormError(null);
    setDialogOpen(true);
  };

  /**
   * Close the task dialog
   */
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
    setFormError(null);
  };

  /**
   * Handle form field changes
   */
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'priority' || name === 'projectId' ? Number(value) : value,
    }));
  };

  /**
   * Handle due date change in form
   */
  const handleFormDateChange = (date: Dayjs | null) => {
    setFormDueDate(date);
    if (date) {
      setFormData((prev) => ({
        ...prev,
        dueDate: date.format('YYYY-MM-DD'),
      }));
    }
  };

  /**
   * Submit task form (create or update)
   */
  const handleSubmit = async () => {
    setFormLoading(true);
    setFormError(null);

    try {
      if (editingTask) {
        // Update existing task
        await taskApi.updateTask(editingTask.id!, formData);
      } else {
        // Create new task
        await taskApi.createTask(formData);
      }

      handleCloseDialog();
      loadTasks();

      // Notify parent component
      if (onTaskChanged) {
        onTaskChanged();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || `Failed to ${editingTask ? 'update' : 'create'} task`);
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Delete a task
   */
  const handleDelete = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskApi.deleteTask(taskId);
      loadTasks();

      // Notify parent component
      if (onTaskChanged) {
        onTaskChanged();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // ============================================
  // Render Loading State
  // ============================================

  if (loading && tasks.length === 0) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  // ============================================
  // Main Render
  // ============================================

  return (
    <>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Tasks</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Create Task
          </Button>
        </Box>

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
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            showDateRangePicker={true}
            showDateRangeSelector={false}
            showStatusFilter={true}
          />
        </Box>

        {/* Error Message */}
        {error && <ErrorMessage message={error} onRetry={loadTasks} />}

        {/* Task Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task Name</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Assignee</TableCell>
                <TableCell align="center">Priority</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <LoadingSpinner message="Loading tasks..." />
                  </TableCell>
                </TableRow>
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No tasks found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.projectName || `Project ${task.projectId}`}</TableCell>
                    <TableCell>{task.assignee}</TableCell>
                    <TableCell align="center">
                      <PriorityChip priority={task.priority} />
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip status={task.status} />
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: getDueDateBackgroundColor(task),
                        fontWeight: 'medium',
                        color: getDueDateTextColor(task),
                      }}
                    >
                      {dayjs(task.dueDate).format('MMM DD, YYYY')}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditDialog(task)}
                        title="Edit task"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(task.id!)}
                        title="Delete task"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={PAGINATION.ROWS_PER_PAGE_OPTIONS}
        />
      </Paper>

      {/* Create/Edit Task Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
          {formError && (
            <Box mb={2}>
              <Typography color="error">{formError}</Typography>
            </Box>
          )}
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Task Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Task Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  disabled={formLoading}
                />
              </Grid>

              {/* Assignee */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Assignee"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleFormChange}
                  disabled={formLoading}
                />
              </Grid>

              {/* Project */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Project</InputLabel>
                  <Select
                    name="projectId"
                    value={formData.projectId.toString()}
                    onChange={handleFormChange}
                    label="Project"
                    disabled={formLoading}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Priority */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority.toString()}
                    onChange={handleFormChange}
                    label="Priority"
                    disabled={formLoading}
                  >
                    {Object.entries(PRIORITY_LABELS).map(([priority, label]) => (
                      <MenuItem key={priority} value={priority}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status */}
              {editingTask && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status || TASK_STATUS.PENDING}
                      onChange={handleFormChange}
                      label="Status"
                      disabled={formLoading}
                    >
                      <MenuItem value={TASK_STATUS.PENDING}>{TASK_STATUS.PENDING}</MenuItem>
                      <MenuItem value={TASK_STATUS.IN_PROGRESS}>{TASK_STATUS.IN_PROGRESS}</MenuItem>
                      <MenuItem value={TASK_STATUS.COMPLETED}>{TASK_STATUS.COMPLETED}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Due Date */}
              <Grid item xs={12} sm={editingTask ? 6 : 12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Due Date"
                    value={formDueDate}
                    onChange={handleFormDateChange}
                    disabled={formLoading}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={formLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={formLoading || !formData.name || !formData.assignee || !formData.dueDate}
          >
            {formLoading ? 'Saving...' : editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskList;
