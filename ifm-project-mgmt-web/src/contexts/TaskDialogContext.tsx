/**
 * TaskDialogContext - Manages task dialog and form state
 */
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { taskApi } from '../services/api';
import type { Task, User, CreateTaskRequest } from '../types';

interface TaskDialogContextState {
  // Dialog state
  dialogOpen: boolean;
  editingTask: Task | null;

  // Form state
  formData: CreateTaskRequest;
  formDueDate: Dayjs | null;
  selectedUser: User | null;
  formError: string | null;
  formLoading: boolean;

  // Success notification state
  successOpen: boolean;
  successMessage: string;

  // Actions
  openCreateDialog: () => void;
  openEditDialog: (task: Task, users: User[]) => void;
  closeDialog: () => void;
  handleFormChange: (name: string, value: string | number) => void;
  handleFormDateChange: (date: Dayjs | null) => void;
  handleUserChange: (user: User | null) => void;
  submitForm: (onSuccess: () => void) => Promise<void>;
  closeSuccess: () => void;
}

const TaskDialogContext = createContext<TaskDialogContextState | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useTaskDialogContext = () => {
  const context = useContext(TaskDialogContext);
  if (!context) {
    throw new Error('useTaskDialogContext must be used within TaskDialogProvider');
  }
  return context;
};

interface TaskDialogProviderProps {
  children: ReactNode;
}

export const TaskDialogProvider = ({ children }: TaskDialogProviderProps) => {
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form state
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

  // Actions
  const openCreateDialog = useCallback(() => {
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
  }, []);

  const openEditDialog = useCallback((task: Task, users: User[]) => {
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
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingTask(null);
    setFormError(null);
  }, []);

  const handleFormChange = useCallback((name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'priority' || name === 'projectId' ? Number(value) : value,
    }));
  }, []);

  const handleFormDateChange = useCallback((date: Dayjs | null) => {
    setFormDueDate(date);
    if (date) {
      setFormData((prev) => ({
        ...prev,
        dueDate: date.format('YYYY-MM-DD'),
      }));
    }
  }, []);

  const handleUserChange = useCallback((user: User | null) => {
    setSelectedUser(user);
    if (user) {
      setFormData((prev) => ({ ...prev, assignee: user.email }));
    } else {
      setFormData((prev) => ({ ...prev, assignee: '' }));
    }
  }, []);

  const submitForm = useCallback(async (onSuccess: () => void) => {
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
      onSuccess();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || `Failed to ${editingTask ? 'update' : 'create'} task`);
    } finally {
      setFormLoading(false);
    }
  }, [editingTask, formData, closeDialog]);

  const closeSuccess = useCallback(() => {
    setSuccessOpen(false);
  }, []);

  const value: TaskDialogContextState = useMemo(() => ({
    dialogOpen,
    editingTask,
    formData,
    formDueDate,
    selectedUser,
    formError,
    formLoading,
    successOpen,
    successMessage,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleFormChange,
    handleFormDateChange,
    handleUserChange,
    submitForm,
    closeSuccess,
  }), [
    dialogOpen,
    editingTask,
    formData,
    formDueDate,
    selectedUser,
    formError,
    formLoading,
    successOpen,
    successMessage,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleFormChange,
    handleFormDateChange,
    handleUserChange,
    submitForm,
    closeSuccess,
  ]);

  return <TaskDialogContext.Provider value={value}>{children}</TaskDialogContext.Provider>;
};
