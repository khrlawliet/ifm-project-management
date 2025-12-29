/**
 * TaskTable Component
 * Reusable table for displaying tasks list
 */

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import type { Task } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { PriorityChip, StatusChip } from '../common/TaskChips';
import {
  getDueDateBackgroundColor,
  getDueDateTextColor,
} from '../../utils/taskUtils';
import { useTaskContext } from '../../contexts/TaskContext';

interface TaskTableProps {
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

const TaskTable = ({
  onEdit,
  onDelete,
}: TaskTableProps) => {
  const { tasks, loading } = useTaskContext();

  return (
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
          {(() => {
            if (loading) {
              return (
                <TableRow>
                  <TableCell colSpan={7}>
                    <LoadingSpinner message="Loading tasks..." />
                  </TableCell>
                </TableRow>
              );
            }
            if (tasks.length === 0) {
              return (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No tasks found
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            }
            return tasks.map((task) => (
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
                    onClick={() => onEdit(task)}
                    title="Edit task"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(task.id!)}
                    title="Delete task"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ));
          })()}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskTable;
