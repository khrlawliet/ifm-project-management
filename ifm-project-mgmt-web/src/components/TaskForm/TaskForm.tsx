import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { taskApi, projectApi } from '../../services/api';
import type { CreateTaskRequest, Project } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface TaskFormProps {
  onTaskCreated?: () => void;
}

const TaskForm = ({ onTaskCreated }: TaskFormProps) => {
  const [formData, setFormData] = useState<CreateTaskRequest>({
    name: '',
    priority: 1,
    dueDate: '',
    assignee: '',
    projectId: 0,
  });
  const [dueDate, setDueDate] = useState<Dayjs | null>(dayjs().add(1, 'day'));
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const data = await projectApi.getProjects();
      setProjects(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, projectId: data[0].id }));
      }
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'priority' || name === 'projectId' ? Number(value) : value,
    }));
  };

  const handleDateChange = (date: Dayjs | null) => {
    setDueDate(date);
    if (date) {
      setFormData((prev) => ({
        ...prev,
        dueDate: date.format('YYYY-MM-DD'),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await taskApi.createTask(formData);
      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        priority: 1,
        dueDate: '',
        assignee: '',
        projectId: projects.length > 0 ? projects[0].id : 0,
      });
      setDueDate(dayjs().add(1, 'day'));

      if (onTaskCreated) {
        onTaskCreated();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProjects) {
    return <LoadingSpinner message="Loading projects..." />;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create New Task
      </Typography>

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
      {success && (
        <Box my={2}>
          <Typography color="success.main">Task created successfully!</Typography>
        </Box>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Task Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Assignee"
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Project</InputLabel>
              <Select
                name="projectId"
                value={formData.projectId.toString()}
                onChange={handleChange}
                label="Project"
                disabled={loading}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority.toString()}
                onChange={handleChange}
                label="Priority"
                disabled={loading}
              >
                {[1, 2, 3, 4, 5].map((p) => (
                  <MenuItem key={p} value={p}>
                    {p} {p === 1 && '(Highest)'} {p === 5 && '(Lowest)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Due Date"
                value={dueDate}
                onChange={handleDateChange}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || !formData.name || !formData.assignee || !formData.dueDate}
              fullWidth
            >
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TaskForm;
