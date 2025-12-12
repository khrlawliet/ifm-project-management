/**
 * useTaskFilters Hook
 * Custom hook for managing task filter state
 * Follows Single Responsibility Principle by isolating filter logic
 */

import { useState } from 'react';
import type { Dayjs } from 'dayjs';
import type { SelectChangeEvent } from '@mui/material/Select';
import { DATE_FILTER } from '../constants/taskConstants';

interface UseTaskFiltersReturn {
  // State
  selectedProject: number | '';
  priorityFilter: number | '';
  statusFilter: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  dateFilter: typeof DATE_FILTER.ALL | typeof DATE_FILTER.THIS_WEEK;

  // Handlers
  handleProjectChange: (e: SelectChangeEvent) => void;
  handlePriorityFilterChange: (e: SelectChangeEvent) => void;
  handleStatusFilterChange: (e: SelectChangeEvent) => void;
  handleStartDateChange: (date: Dayjs | null) => void;
  handleEndDateChange: (date: Dayjs | null) => void;
  handleDateFilterChange: (e: SelectChangeEvent) => void;
}

/**
 * useTaskFilters - Manages all task filter state and handlers
 *
 * This hook centralizes filter management to:
 * - Reduce code duplication between TaskList and TaskCalendar
 * - Provide a consistent interface for filter operations
 * - Make filter logic easier to test and maintain
 *
 * @returns Object containing filter state and handler functions
 */
export const useTaskFilters = (): UseTaskFiltersReturn => {
  // Filter State
  const [selectedProject, setSelectedProject] = useState<number | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [dateFilter, setDateFilter] = useState<typeof DATE_FILTER.ALL | typeof DATE_FILTER.THIS_WEEK>(DATE_FILTER.ALL);

  /**
   * Handle project selection change
   */
  const handleProjectChange = (e: SelectChangeEvent) => {
    setSelectedProject(e.target.value as number | '');
  };

  /**
   * Handle priority filter change
   */
  const handlePriorityFilterChange = (e: SelectChangeEvent) => {
    setPriorityFilter(e.target.value as number | '');
  };

  /**
   * Handle status filter change
   */
  const handleStatusFilterChange = (e: SelectChangeEvent) => {
    setStatusFilter(e.target.value);
  };

  /**
   * Handle start date change
   */
  const handleStartDateChange = (date: Dayjs | null) => {
    setStartDate(date);
  };

  /**
   * Handle end date change
   */
  const handleEndDateChange = (date: Dayjs | null) => {
    setEndDate(date);
  };

  /**
   * Handle date filter change (for calendar view)
   */
  const handleDateFilterChange = (e: SelectChangeEvent) => {
    setDateFilter(e.target.value as typeof DATE_FILTER.ALL | typeof DATE_FILTER.THIS_WEEK);
  };

  return {
    // State
    selectedProject,
    priorityFilter,
    statusFilter,
    startDate,
    endDate,
    dateFilter,

    // Handlers
    handleProjectChange,
    handlePriorityFilterChange,
    handleStatusFilterChange,
    handleStartDateChange,
    handleEndDateChange,
    handleDateFilterChange,
  };
};
