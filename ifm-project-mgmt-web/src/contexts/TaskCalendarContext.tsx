/**
 * TaskCalendarContext - Manages task calendar state, filtering, and date selection
 */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { taskApi } from '../services/api';
import type { Task, Project } from '../types';
import { PAGINATION, SORT_BY, DATE_FILTER } from '../constants/taskConstants';
import { filterTasksByPriority, filterTasksByStatus } from '../utils/taskUtils';
import { useAppContext } from './AppContext';

interface TaskCalendarContextState {
  // Data
  tasks: Task[];
  projects: Project[];
  loading: boolean;
  error: string | null;

  // Calendar state
  selectedDate: Dayjs;

  // Filters
  selectedProject: number | '';
  priorityFilter: number | '';
  statusFilter: string;
  dateFilter: string;
  sortBy: 'priority' | 'dueDate';

  // Actions
  loadTasksForMonth: () => Promise<void>;
  handleDateChange: (date: Dayjs | null) => void;
  handleProjectChange: (value: number | '') => void;
  handlePriorityFilterChange: (value: number | '') => void;
  handleStatusFilterChange: (value: string) => void;
  handleDateFilterChange: (value: string) => void;
  handleSortChange: (value: 'priority' | 'dueDate') => void;
  setError: (error: string | null) => void;
}

const TaskCalendarContext = createContext<TaskCalendarContextState | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useTaskCalendarContext = () => {
  const context = useContext(TaskCalendarContext);
  if (!context) {
    throw new Error('useTaskCalendarContext must be used within TaskCalendarProvider');
  }
  return context;
};

interface TaskCalendarProviderProps {
  children: ReactNode;
  refresh?: number;
}

export const TaskCalendarProvider = ({ children, refresh }: TaskCalendarProviderProps) => {
  // Get shared projects from AppContext
  const { projects } = useAppContext();

  // Data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  // Filter state
  const [selectedProject, setSelectedProject] = useState<number | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>(DATE_FILTER.ALL);
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate'>(SORT_BY.DUE_DATE);

  // Load tasks when dependencies change
  useEffect(() => {
    loadTasksForMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedProject, dateFilter, priorityFilter, statusFilter, sortBy, refresh]);

  // Load functions

  const loadTasksForMonth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine date range based on dateFilter
      let startDate: string;
      let endDate: string;
      const today = dayjs();

      switch (dateFilter) {
        case DATE_FILTER.THIS_WEEK: {
          startDate = today.startOf('week').format('YYYY-MM-DD');
          endDate = today.endOf('week').format('YYYY-MM-DD');
          break;
        }

        case DATE_FILTER.NEXT_WEEK: {
          const nextWeek = today.add(1, 'week');
          startDate = nextWeek.startOf('week').format('YYYY-MM-DD');
          endDate = nextWeek.endOf('week').format('YYYY-MM-DD');
          break;
        }

        case DATE_FILTER.NEXT_MONTH: {
          const nextMonth = today.add(1, 'month');
          startDate = nextMonth.startOf('month').format('YYYY-MM-DD');
          endDate = nextMonth.endOf('month').format('YYYY-MM-DD');
          break;
        }

        default: {
          startDate = selectedDate.startOf('month').format('YYYY-MM-DD');
          endDate = selectedDate.endOf('month').format('YYYY-MM-DD');
          break;
        }
      }

      let response;

      if (selectedProject) {
        response = await taskApi.getTasks(Number(selectedProject), {
          startDate,
          endDate,
          sortBy: sortBy,
          size: PAGINATION.CALENDAR_PAGE_SIZE,
        });
      } else {
        response = await taskApi.getAllTasks({
          startDate,
          endDate,
          sortBy: sortBy,
          size: PAGINATION.CALENDAR_PAGE_SIZE,
        });
      }

      // Apply client-side filters
      let filteredTasks = filterTasksByPriority(response.content, priorityFilter);
      filteredTasks = filterTasksByStatus(filteredTasks, statusFilter);

      setTasks(filteredTasks);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, dateFilter, selectedProject, sortBy, priorityFilter, statusFilter]);

  // Action handlers
  const handleDateChange = useCallback((date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
    }
  }, []);

  const handleProjectChange = useCallback((value: number | '') => {
    setSelectedProject(value);
  }, []);

  const handlePriorityFilterChange = useCallback((value: number | '') => {
    setPriorityFilter(value);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const handleDateFilterChange = useCallback((value: string) => {
    setDateFilter(value);
  }, []);

  const handleSortChange = useCallback((value: 'priority' | 'dueDate') => {
    setSortBy(value);
  }, []);

  const value: TaskCalendarContextState = useMemo(() => ({
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
    setError,
  }), [
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
  ]);

  return <TaskCalendarContext.Provider value={value}>{children}</TaskCalendarContext.Provider>;
};
