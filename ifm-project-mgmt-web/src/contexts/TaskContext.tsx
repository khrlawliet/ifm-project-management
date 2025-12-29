/**
 * TaskContext - Manages task list state, filtering, and pagination
 */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Dayjs } from 'dayjs';
import { taskApi } from '../services/api';
import type { Task, Project, User, TaskFilters as TaskFiltersType } from '../types';
import { PAGINATION, SORT_BY } from '../constants/taskConstants';
import { filterTasksByPriority, filterTasksByStatus } from '../utils/taskUtils';
import { useAppContext } from './AppContext';

interface TaskContextState {
  // Data
  tasks: Task[];
  projects: Project[];
  users: User[];
  loading: boolean;
  error: string | null;

  // Pagination
  page: number;
  rowsPerPage: number;
  totalElements: number;

  // Filters
  selectedProject: number | '';
  priorityFilter: number | '';
  statusFilter: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  sortBy: 'priority' | 'dueDate';
  taskNameSearch: string;
  activeSearchTerm: string;
  advancedSearch: boolean;

  // Actions
  loadTasks: () => Promise<void>;
  handleProjectChange: (value: number | '') => void;
  handlePriorityFilterChange: (value: number | '') => void;
  handleStatusFilterChange: (value: string) => void;
  handleStartDateChange: (date: Dayjs | null) => void;
  handleEndDateChange: (date: Dayjs | null) => void;
  handleSortChange: (value: 'priority' | 'dueDate') => void;
  handleSearch: () => void;
  handleSearchInputChange: (value: string) => void;
  handleAdvancedSearchToggle: (value: boolean) => void;
  handlePageChange: (newPage: number) => void;
  handleRowsPerPageChange: (newRowsPerPage: number) => void;
  deleteTask: (taskId: number) => Promise<void>;
  setError: (error: string | null) => void;
}

const TaskContext = createContext<TaskContextState | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
  onTaskChanged?: () => void;
}

export const TaskProvider = ({ children, onTaskChanged }: TaskProviderProps) => {
  // Get shared data from AppContext
  const { projects, users } = useAppContext();

  // Data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION.DEFAULT_ROWS_PER_PAGE);
  const [totalElements, setTotalElements] = useState(0);

  // Filter state
  const [selectedProject, setSelectedProject] = useState<number | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate'>(SORT_BY.DUE_DATE);
  const [taskNameSearch, setTaskNameSearch] = useState<string>('');
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>('');
  const [advancedSearch, setAdvancedSearch] = useState<boolean>(false);

  // API filter state
  const [apiFilters, setApiFilters] = useState<TaskFiltersType>({
    sortBy: SORT_BY.DUE_DATE,
  });

  // Load functions
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;

      if (apiFilters.projectId) {
        response = await taskApi.getTasks(apiFilters.projectId, {
          startDate: apiFilters.startDate,
          endDate: apiFilters.endDate,
          sortBy: apiFilters.sortBy,
          page,
          size: rowsPerPage,
        });
      } else {
        response = await taskApi.getAllTasks({
          ...apiFilters,
          page,
          size: rowsPerPage,
        });
      }

      // Apply client-side filters
      let filteredTasks = filterTasksByPriority(response.content, priorityFilter);
      filteredTasks = filterTasksByStatus(filteredTasks, statusFilter);

      // Apply task name search filter
      if (activeSearchTerm.trim()) {
        const searchLower = activeSearchTerm.toLowerCase();
        filteredTasks = filteredTasks.filter(task =>
          task.name.toLowerCase().includes(searchLower)
        );
      }

      setTasks(filteredTasks);
      setTotalElements((priorityFilter || statusFilter || activeSearchTerm) ? filteredTasks.length : response.totalElements);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, apiFilters, priorityFilter, statusFilter, activeSearchTerm]);

  // Action handlers
  const handleProjectChange = useCallback((value: number | '') => {
    setSelectedProject(value);
  }, []);

  const handlePriorityFilterChange = useCallback((value: number | '') => {
    setPriorityFilter(value);
    setPage(PAGINATION.DEFAULT_PAGE);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setPage(PAGINATION.DEFAULT_PAGE);
  }, []);

  const handleStartDateChange = useCallback((date: Dayjs | null) => {
    setStartDate(date);
  }, []);

  const handleEndDateChange = useCallback((date: Dayjs | null) => {
    setEndDate(date);
  }, []);

  const handleSortChange = useCallback((value: 'priority' | 'dueDate') => {
    setSortBy(value);
  }, []);

  const handleSearch = useCallback(() => {
    setActiveSearchTerm(taskNameSearch);
    setPage(PAGINATION.DEFAULT_PAGE);
  }, [taskNameSearch]);

  const handleSearchInputChange = useCallback((value: string) => {
    setTaskNameSearch(value);
  }, []);

  const handleAdvancedSearchToggle = useCallback((value: boolean) => {
    setAdvancedSearch(value);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(PAGINATION.DEFAULT_PAGE);
  }, []);

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      await taskApi.deleteTask(taskId);
      await loadTasks();
      if (onTaskChanged) {
        onTaskChanged();
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete task');
    }
  }, [loadTasks, onTaskChanged]);

  // Update API filters when relevant filters change
  useEffect(() => {
    const newApiFilters = {
      sortBy: sortBy,
      projectId: selectedProject ? Number(selectedProject) : undefined,
      startDate: startDate ? startDate.format('YYYY-MM-DD') : undefined,
      endDate: endDate ? endDate.format('YYYY-MM-DD') : undefined,
    };

    // Batch both state updates together to prevent double render
    setApiFilters(prevFilters => {
      // Only update if filters actually changed
      const filtersChanged =
        prevFilters.sortBy !== newApiFilters.sortBy ||
        prevFilters.projectId !== newApiFilters.projectId ||
        prevFilters.startDate !== newApiFilters.startDate ||
        prevFilters.endDate !== newApiFilters.endDate;

      if (filtersChanged) {
        setPage(PAGINATION.DEFAULT_PAGE);
        return newApiFilters;
      }
      return prevFilters;
    });
  }, [selectedProject, startDate, endDate, sortBy]);

  // Load tasks when filters or pagination change
  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, apiFilters, priorityFilter, statusFilter, activeSearchTerm]);

  const value: TaskContextState = useMemo(() => ({
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
    activeSearchTerm,
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
    setError,
  }), [
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
    activeSearchTerm,
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
  ]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
