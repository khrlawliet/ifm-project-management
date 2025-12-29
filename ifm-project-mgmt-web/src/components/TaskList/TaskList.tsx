/**
 * TaskList Component (Refactored - Modular Components)
 *
 * This component displays a paginated table of tasks with filtering capabilities.
 *
 * Architecture:
 * - Uses Context only for shared task data
 * - Dialog/form state managed locally in this component
 * - Table and Dialog extracted into separate reusable components
 * - Clean separation of concerns
 */

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TablePagination,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
  Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

// Contexts
import { TaskProvider, useTaskContext } from '../../contexts/TaskContext';

// API
import { taskApi } from '../../services/api';

// Types
import type { Task, User, CreateTaskRequest } from '../../types';

// Components
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmDialog from '../common/ConfirmDialog';
import TaskFilters from '../common/TaskFilters';
import TaskTable from './TaskTable';
import TaskDialog from './TaskDialog';

// Constants
import {
  PAGINATION,
  SORT_BY,
} from '../../constants/taskConstants';

interface TaskListProps {
  onTaskChanged?: () => void;
}

/**
 * TaskList Content Component
 * Contains the actual UI logic with local dialog state
 */
const TaskListContent = () => {
  // Access task context (shared data only)
  const {
    tasks,
    projects,
    users,
    loading,
    error,
    page,
    rowsPerPage,
    totalElements,
    selectedProject,
    priorityFilter,
    statusFilter,
    startDate,
    endDate,
    sortBy,
    taskNameSearch,
    advancedSearch,
    loadTasks,
    handleProjectChange,
    handlePriorityFilterChange,
    handleStatusFilterChange,
    handleStartDateChange,
    handleEndDateChange,
    handleSortChange,
    handleSearch,
    handleSearchInputChange,
    handleAdvancedSearchToggle,
    handlePageChange,
    handleRowsPerPageChange,
    deleteTask,
  } = useTaskContext();

  // Local dialog state (UI-only, no need for context)
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Success notification state
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Confirm delete dialog state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Dialog actions
  const openCreateDialog = () => {
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

  const openEditDialog = (task: Task) => {
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
    const user = users.find(u => u.email === task.assignee);
    setSelectedUser(user || null);
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
    setFormError(null);
  };

  const handleFormChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'priority' || name === 'projectId' ? Number(value) : value,
    }));
  };

  const handleFormDateChange = (date: Dayjs | null) => {
    setFormDueDate(date);
    if (date) {
      setFormData((prev) => ({
        ...prev,
        dueDate: date.format('YYYY-MM-DD'),
      }));
    }
  };

  const handleUserChange = (user: User | null) => {
    setSelectedUser(user);
    if (user) {
      setFormData((prev) => ({ ...prev, assignee: user.email }));
    } else {
      setFormData((prev) => ({ ...prev, assignee: '' }));
    }
  };

  const handleFormSubmit = async () => {
    setFormLoading(true);
    setFormError(null);

    try {
      if (editingTask) {
        await taskApi.updateTask(editingTask.id!, formData);
        setSuccessMessage('Task updated successfully!');
      } else {
        await taskApi.createTask(formData);
        setSuccessMessage('Task created successfully!');
      }

      closeDialog();
      setSuccessOpen(true);
      await loadTasks();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || `Failed to ${editingTask ? 'update' : 'create'} task`);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setConfirmDeleteOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete !== null) {
      await deleteTask(taskToDelete.id!);
      setConfirmDeleteOpen(false);
      setTaskToDelete(null);
      setSuccessMessage(`Task "${taskToDelete.name}" deleted successfully!`);
      setSuccessOpen(true);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setTaskToDelete(null);
  };

  // Wrapper functions to match TaskFilters interface (expects SelectChangeEvent)
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

  // Render loading state
  if (loading && tasks.length === 0) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

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
            onClick={openCreateDialog}
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
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                  onChange={(e) => handleAdvancedSearchToggle(e.target.checked)}
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
              onProjectChange={handleProjectChangeWrapper}
              selectedPriority={priorityFilter}
              onPriorityChange={handlePriorityFilterChangeWrapper}
              selectedStatus={statusFilter}
              onStatusChange={handleStatusFilterChangeWrapper}
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
          </Box>
        )}

        {/* Error Message */}
        {error && <ErrorMessage message={error} onRetry={loadTasks} />}

        {/* Task Table */}
        <TaskTable
          onEdit={openEditDialog}
          onDelete={handleDeleteClick}
        />

        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_event, newPage) => handlePageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => handleRowsPerPageChange(Number.parseInt(event.target.value, 10))}
          rowsPerPageOptions={PAGINATION.ROWS_PER_PAGE_OPTIONS}
        />
      </Paper>

      {/* Create/Edit Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        editingTask={editingTask}
        formData={formData}
        formDueDate={formDueDate}
        selectedUser={selectedUser}
        formError={formError}
        formLoading={formLoading}
        onClose={closeDialog}
        onFormChange={handleFormChange}
        onFormDateChange={handleFormDateChange}
        onUserChange={handleUserChange}
        onSubmit={handleFormSubmit}
      />

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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

/**
 * TaskList Component with Context Provider
 * Only wraps with TaskContext for shared task data
 */
const TaskList = ({ onTaskChanged }: TaskListProps) => {
  return (
    <TaskProvider onTaskChanged={onTaskChanged}>
      <TaskListContent />
    </TaskProvider>
  );
};

export default TaskList;
