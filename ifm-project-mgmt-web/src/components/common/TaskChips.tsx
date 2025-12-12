/**
 * TaskChips Component
 * Reusable components for displaying task priority and status as chips
 */

import { Chip } from '@mui/material';
import { getPriorityBadgeColor, getStatusColor } from '../../utils/taskUtils';

interface PriorityChipProps {
  priority: number;
  size?: 'small' | 'medium';
}

/**
 * PriorityChip - Displays task priority as a colored chip
 * Uses the same colors as calendar badge:
 * 1 = Red, 2 = Orange, 3 = Yellow, 4 = Blue, 5 = Green
 *
 * @param priority - The task priority (1-5)
 * @param size - The size of the chip (default: 'small')
 */
export const PriorityChip = ({ priority, size = 'small' }: PriorityChipProps) => {
  const backgroundColor = getPriorityBadgeColor(priority);

  return (
    <Chip
      label={priority}
      size={size}
      sx={{
        backgroundColor: backgroundColor,
        color: '#fff',
        fontWeight: 'bold',
      }}
    />
  );
};

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

/**
 * StatusChip - Displays task status as a colored chip
 *
 * @param status - The task status (COMPLETED, IN_PROGRESS, PENDING)
 * @param size - The size of the chip (default: 'small')
 * @param variant - The variant of the chip (default: 'outlined')
 */
export const StatusChip = ({ status, size = 'small', variant = 'outlined' }: StatusChipProps) => {
  return (
    <Chip
      label={status}
      color={getStatusColor(status)}
      size={size}
      variant={variant}
    />
  );
};
