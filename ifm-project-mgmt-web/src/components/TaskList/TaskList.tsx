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
  Autocomplete,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Grid } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

// API and Types
import { taskApi, projectApi, userApi } from '../../services/api';
import type { Task, Project, User, CreateTaskRequest, TaskFilters as TaskFiltersType } from '../../types';

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
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION.DEFAULT_ROWS_PER_PAGE);
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

  // Sort state
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate'>(SORT_BY.DUE_DATE);

  // Search state
  const [taskNameSearch, setTaskNameSearch] = useState<string>('');
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>(''); // The active search being applied
  const [advancedSearch, setAdvancedSearch] = useState<boolean>(false);

  // API filter state (for backend calls)
  const [apiFilters, setApiFilters] = useState<TaskFiltersType>({
    sortBy: SORT_BY.DUE_DATE,
  });

  // Task creation/editing dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<CreateTaskRequest>({
    name: '',
    priority: 0,
    dueDate: '',
    assignee: '',
    projectId: 0,
  });
  const [formDueDate, setFormDueDate] = useState<Dayjs | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Success notification state
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
   * Load users on component mount
   */
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Update API filters when project, dates, or sort changes
   * Note: taskName is NOT sent to API - it's filtered client-side
   */
  useEffect(() => {
    setApiFilters({
      sortBy: sortBy,
      projectId: selectedProject ? Number(selectedProject) : undefined,
      startDate: startDate ? startDate.format('YYYY-MM-DD') : undefined,
      endDate: endDate ? endDate.format('YYYY-MM-DD') : undefined,
    });
    setPage(PAGINATION.DEFAULT_PAGE); // Reset to first page on filter change
  }, [selectedProject, startDate, endDate, sortBy]);

  /**
   * Load tasks when filters, pagination, or active search term change
   */
  useEffect(() => {
    loadTasks();
  }, [page, rowsPerPage, apiFilters, priorityFilter, statusFilter, activeSearchTerm]);

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
   * Load users from API
   */
  const loadUsers = async () => {
    try {
      console.log('Fetching users from API...');
      const data = await userApi.getUsers();
      console.log('Users loaded:', data);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
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

      // Apply task name search filter (client-side)
      if (activeSearchTerm.trim()) {
        const searchLower = activeSearchTerm.toLowerCase();
        filteredTasks = filteredTasks.filter(task =>
          task.name.toLowerCase().includes(searchLower)
        );
      }

      setTasks(filteredTasks);
      setTotalElements((priorityFilter || statusFilter || activeSearchTerm) ? filteredTasks.length : response.totalElements);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Event Handlers - Search
  // ============================================

  /**
   * Handle search button click
   * Applies the search term and resets to first page
   */
  const handleSearch = () => {
    setActiveSearchTerm(taskNameSearch);
    setPage(PAGINATION.DEFAULT_PAGE);
  };

  // ============================================
  // Event Handlers - Pagination
  // ============================================

  /**
   * Handle page change in pagination
   */
  const handleChangePage = (_event: unknown, newPage: number) => {
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
    setFormData({
      name: '',
      priority: 0,
      dueDate: '',
      assignee: '',
      projectId: 0,
    });
    setFormDueDate(null);
    setSelectedUser(null);
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
    // Find and set the selected user
    const user = users.find(u => u.email === task.assignee);
    setSelectedUser(user || null);
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
        setSuccessMessage('Task updated successfully!');
      } else {
        // Create new task
        await taskApi.createTask(formData);
        setSuccessMessage('Task created successfully!');
      }

      handleCloseDialog();
      setSuccessOpen(true);
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

        {/* Search Section */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <TextField
              fullWidth
              label="Search Task Name"
              placeholder="Enter task name to search..."
              value={taskNameSearch}
              onChange={(e) => setTaskNameSearch(e.target.value)}
              onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
              variant="outlined"
              size="medium"
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              sx={{ height: '56px', minWidth: '100px' }}
            >
              Search
            </Button>
            <FormControlLabel
              control={
                <Checkbox
                  checked={advancedSearch}
                  onChange={(e) => setAdvancedSearch(e.target.checked)}
                  color="primary"
                />
              }
              label="Advanced Search"
              sx={{ whiteSpace: 'nowrap' }}
            />
          </Box>
        </Box>

        {/* Filters - Only show if Advanced Search is enabled */}
        {advancedSearch && (
          <Box mb={3}>
            {/* First Row: Project, Priority, Status */}
            <TaskFilters
              selectedProject={selectedProject}
              projects={projects}
              onProjectChange={handleProjectChange}
              selectedPriority={priorityFilter}
              onPriorityChange={handlePriorityFilterChange}
              selectedStatus={statusFilter}
              onStatusChange={handleStatusFilterChange}
              showDateRangePicker={false}
              showDateRangeSelector={false}
              showStatusFilter={true}
            />

          {/* Second Row: Due Date and Sort By */}
          <Grid container spacing={2} mt={1}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle2" fontWeight="medium" mb={2}>
                  Due Date
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box display="flex" gap={1}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                        },
                      }}
                    />
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                        },
                      }}
                    />
                  </Box>
                </LocalizationProvider>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Filter tasks by due date range
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
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
          </Box>
        )}

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
              <Grid size={{ xs: 12 }}>
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
              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  options={users}
                  getOptionLabel={(option) =>
                    `${option.fullName || option.username} (${option.email})`
                  }
                  value={selectedUser}
                  onChange={(_event, newValue) => {
                    setSelectedUser(newValue);
                    if (newValue) {
                      setFormData((prev) => ({ ...prev, assignee: newValue.email }));
                    } else {
                      setFormData((prev) => ({ ...prev, assignee: '' }));
                    }
                  }}
                  disabled={formLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assignee"
                      required
                      placeholder="Search by username or email"
                    />
                  )}
                  filterOptions={(options, { inputValue }) => {
                    const searchTerm = inputValue.toLowerCase();
                    return options.filter(
                      (option) =>
                        option.username.toLowerCase().includes(searchTerm) ||
                        option.email.toLowerCase().includes(searchTerm) ||
                        (option.fullName?.toLowerCase() || '').includes(searchTerm)
                    );
                  }}
                />
              </Grid>

              {/* Project */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel shrink>Project</InputLabel>
                  <Select
                    name="projectId"
                    value={formData.projectId === 0 ? '' : formData.projectId.toString()}
                    onChange={handleFormChange}
                    label="Project"
                    disabled={formLoading}
                    displayEmpty
                    notched
                  >
                    <MenuItem value="" disabled>
                      Select Project
                    </MenuItem>
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Priority */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel shrink>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority === 0 ? '' : formData.priority.toString()}
                    onChange={handleFormChange}
                    label="Priority"
                    disabled={formLoading}
                    displayEmpty
                    notched
                  >
                    <MenuItem value="" disabled>
                      Select Priority
                    </MenuItem>
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
                <Grid size={{ xs: 12, sm: 6 }}>
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
              <Grid size={{ xs: 12, sm: editingTask ? 6 : 12 }}>
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
                        placeholder: 'Select Due Date',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            disabled={formLoading}
            color="error"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={formLoading || !formData.name || !formData.assignee || !formData.dueDate || formData.projectId === 0 || formData.priority === 0}
          >
            {formLoading ? 'Saving...' : editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TaskList;
