/**
 * TaskDialog Component
 * Reusable dialog for creating and editing tasks
 */

import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Grid,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import type { Task, User, CreateTaskRequest } from '../../types';
import { PRIORITY_LABELS, TASK_STATUS } from '../../constants/taskConstants';
import { useTaskContext } from '../../contexts/TaskContext';

interface TaskDialogProps {
  open: boolean;
  editingTask: Task | null;
  formData: CreateTaskRequest;
  formDueDate: Dayjs | null;
  selectedUser: User | null;
  formError: string | null;
  formLoading: boolean;
  onClose: () => void;
  onFormChange: (name: string, value: string | number) => void;
  onFormDateChange: (date: Dayjs | null) => void;
  onUserChange: (user: User | null) => void;
  onSubmit: () => void;
}

const TaskDialog = ({
  open,
  editingTask,
  formData,
  formDueDate,
  selectedUser,
  formError,
  formLoading,
  onClose,
  onFormChange,
  onFormDateChange,
  onUserChange,
  onSubmit,
}: TaskDialogProps) => {
  const { projects, users } = useTaskContext();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
                onChange={(e) => onFormChange(e.target.name, e.target.value)}
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
                onChange={(_event, newValue) => onUserChange(newValue)}
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
                  onChange={(e: SelectChangeEvent) => onFormChange(e.target.name, e.target.value)}
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
                  onChange={(e: SelectChangeEvent) => onFormChange(e.target.name, e.target.value)}
                  label="Priority"
                  disabled={formLoading}
                  displayEmpty
                  notched
                >
                  <MenuItem value="" disabled>
                    Select Priority
                  </MenuItem>
                  {Object.entries(PRIORITY_LABELS).map(([priority, label]) => {
                    const priorityValue = Number.parseInt(priority, 10);
                    return (
                      <MenuItem key={priority} value={priorityValue}>
                        {label}
                      </MenuItem>
                    );
                  })}
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
                    onChange={(e: SelectChangeEvent) => onFormChange(e.target.name, e.target.value)}
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
                  onChange={onFormDateChange}
                  disabled={formLoading}
                  minDate={dayjs().startOf('day')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      placeholder: 'Select Due Date',
                      error: formDueDate?.isBefore(dayjs().startOf('day')) ?? false,
                      helperText: formDueDate?.isBefore(dayjs().startOf('day'))
                        ? 'Due date cannot be in the past'
                        : '',
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
          onClick={onClose}
          disabled={formLoading}
          color="error"
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          color="primary"
          disabled={
            formLoading ||
            !formData.name ||
            !formData.assignee ||
            !formData.dueDate ||
            formData.projectId === 0 ||
            formData.priority === 0 ||
            (formDueDate?.isBefore(dayjs().startOf('day')) ?? false)
          }
        >
          {(() => {
            if (formLoading) return 'Saving...';
            return editingTask ? 'Update' : 'Create';
          })()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog;
