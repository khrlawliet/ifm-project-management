package com.ifm.projectmgmt.service;

import com.ifm.projectmgmt.dto.request.CreateTaskRequest;
import com.ifm.projectmgmt.dto.request.UpdateTaskRequest;
import com.ifm.projectmgmt.dto.request.UpdateTaskStatusRequest;
import com.ifm.projectmgmt.dto.response.PagedResponse;
import com.ifm.projectmgmt.dto.response.TaskResponse;
import com.ifm.projectmgmt.entity.Project;
import com.ifm.projectmgmt.entity.Task;
import com.ifm.projectmgmt.entity.TaskStatus;
import com.ifm.projectmgmt.exception.ConcurrentModificationException;
import com.ifm.projectmgmt.exception.InvalidInputException;
import com.ifm.projectmgmt.exception.ResourceNotFoundException;
import com.ifm.projectmgmt.repository.ProjectRepository;
import com.ifm.projectmgmt.repository.TaskRepository;
import com.ifm.projectmgmt.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for managing tasks.
 * Handles business logic for task operations with thread-safe updates.
 * Uses optimistic locking to prevent concurrent modification conflicts.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final NotificationService notificationService;

    /**
     * Create a new task for a project.
     * Invalidates search cache as new task may appear in search results.
     *
     * @param projectId the project ID
     * @param request   the create task request
     * @return created task response
     * @throws ResourceNotFoundException if project not found
     */
    @Transactional
    public TaskResponse createTask(Long projectId, CreateTaskRequest request) {
        log.info("Creating new task for project id: {}", projectId);

        // Find the project
        Project project = projectRepository.findById(projectId)
                                           .orElseThrow(() -> new ResourceNotFoundException(
                                                   Constants.ERROR_PROJECT_NOT_FOUND + projectId));

        // Create the task
        Task task = new Task();
        task.setName(request.getName());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setAssignee(request.getAssignee());
        task.setStatus(TaskStatus.PENDING);
        task.setProject(project);

        // Save the task
        Task savedTask = taskRepository.save(task);

        log.info("Task created successfully with id: {}", savedTask.getId());

        // Send async notification
        notificationService.sendTaskCreatedNotification(savedTask);

        return mapToResponse(savedTask);
    }

    /**
     * Get all tasks with optional filters and sorting.
     * Results are cached for 5 minutes when taskName filter is used.
     *
     * @param status    the status filter (optional)
     * @param taskName  the task name filter (optional, partial match)
     * @param startDate the start date filter (optional)
     * @param endDate   the end date filter (optional)
     * @param sortBy    the field to sort by (priority or dueDate)
     * @param order     the sort order (asc or desc)
     * @param page      the page number
     * @param size      the page size
     * @return paged task responses
     */
    @Transactional(readOnly = true)
    public PagedResponse<TaskResponse> getAllTasks(
            TaskStatus status,
            String taskName,
            LocalDate startDate,
            LocalDate endDate,
            String sortBy,
            String order,
            int page,
            int size) {

        log.debug("Fetching all tasks with filters - status: {}, taskName: {}, startDate: {}, endDate: {}",
                  status, taskName, startDate, endDate);

        // Validate date range
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new InvalidInputException(Constants.ERROR_INVALID_DATE_RANGE);
        }

        // Create pageable with sorting
        Pageable pageable = createPageable(page, size, sortBy, order);

        // Fetch tasks with optional filters
        Page<Task> taskPage = taskRepository.findAllWithOptionalFilters(
                status, taskName, startDate, endDate, pageable);

        // Map to response
        Page<TaskResponse> responsePage = taskPage.map(this::mapToResponse);

        return PagedResponse.of(responsePage);
    }

    /**
     * Get tasks for a project with optional filters and sorting.
     *
     * @param projectId the project ID
     * @param startDate the start date filter (optional)
     * @param endDate   the end date filter (optional)
     * @param sortBy    the field to sort by (priority or dueDate)
     * @param order     the sort order (asc or desc)
     * @param page      the page number
     * @param size      the page size
     * @return paged task responses
     * @throws ResourceNotFoundException if project not found
     */
    @Transactional(readOnly = true)
    public PagedResponse<TaskResponse> getTasksForProject(
            Long projectId,
            LocalDate startDate,
            LocalDate endDate,
            String sortBy,
            String order,
            int page,
            int size) {

        log.debug("Fetching tasks for project id: {} with filters", projectId);

        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException(Constants.ERROR_PROJECT_NOT_FOUND + projectId);
        }

        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new InvalidInputException(Constants.ERROR_INVALID_DATE_RANGE);
        }

        Pageable pageable = createPageable(page, size, sortBy, order);

        Page<Task> taskPage;
        if (startDate != null || endDate != null) {
            taskPage = taskRepository.findByProjectIdWithOptionalDateRange(
                    projectId, startDate, endDate, pageable);
        } else {
            taskPage = taskRepository.findByProjectId(projectId, pageable);
        }

        Page<TaskResponse> responsePage = taskPage.map(this::mapToResponse);

        return PagedResponse.of(responsePage);
    }

    /**
     * Get a task by ID.
     * Results are cached for 5 minutes to improve performance.
     *
     * @param id the task ID
     * @return task response
     * @throws ResourceNotFoundException if task not found
     */
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        log.debug("Fetching task with id: {} (cache miss)", id);

        Task task = taskRepository.findById(id)
                                  .orElseThrow(() -> new ResourceNotFoundException(
                                          Constants.ERROR_TASK_NOT_FOUND + id));

        return mapToResponse(task);
    }

    /**
     * Update a task.
     * Uses optimistic locking to ensure thread-safe updates.
     * Invalidates both ID cache and search cache on update.
     *
     * @param id      the task ID
     * @param request the update task request
     * @return updated task response
     * @throws ResourceNotFoundException       if task not found
     * @throws ConcurrentModificationException if task was modified concurrently
     */
    @Transactional
    public TaskResponse updateTask(Long id, UpdateTaskRequest request) {
        log.info("Updating task with id: {}", id);

        try {
            Task task = taskRepository.findById(id)
                                      .orElseThrow(() -> new ResourceNotFoundException(
                                              Constants.ERROR_TASK_NOT_FOUND + id));

            List<String> changes = new ArrayList<>();

            if (request.getName() != null && !request.getName().equals(task.getName())) {
                task.setName(request.getName());
                changes.add("name changed to '" + request.getName() + "'");
            }

            if (request.getPriority() != null && !request.getPriority().equals(task.getPriority())) {
                task.setPriority(request.getPriority());
                changes.add("priority changed to " + request.getPriority());
            }

            if (request.getDueDate() != null && !request.getDueDate().equals(task.getDueDate())) {
                task.setDueDate(request.getDueDate());
                changes.add("due date changed to " + request.getDueDate());
            }

            if (request.getAssignee() != null && !request.getAssignee().equals(task.getAssignee())) {
                task.setAssignee(request.getAssignee());
                changes.add("assignee changed to " + request.getAssignee());
            }

            if (request.getStatus() != null && !request.getStatus().equals(task.getStatus())) {
                TaskStatus oldStatus = task.getStatus();
                task.setStatus(request.getStatus());
                changes.add("status changed from " + oldStatus + " to " + request.getStatus());
            }

            Task updatedTask = taskRepository.save(task);

            log.info("Task updated successfully with id: {}", id);

            if (!changes.isEmpty()) {
                String changesStr = String.join(", ", changes);
                notificationService.sendTaskUpdatedNotification(updatedTask, changesStr);
            }

            return mapToResponse(updatedTask);

        } catch (OptimisticLockingFailureException e) {
            log.warn("Optimistic locking failure for task id: {}", id);
            throw new ConcurrentModificationException(Constants.ERROR_CONCURRENT_MODIFICATION);
        }
    }

    /**
     * Update task status only.
     * Uses optimistic locking to ensure thread-safe updates.
     * Invalidates both ID cache and search cache on update.
     *
     * @param id      the task ID
     * @param request the update status request
     * @return updated task response
     * @throws ResourceNotFoundException       if task not found
     * @throws ConcurrentModificationException if task was modified concurrently
     */
    @Transactional
    public TaskResponse updateTaskStatus(Long id, UpdateTaskStatusRequest request) {
        log.info("Updating task status for id: {} to {}", id, request.getStatus());

        try {
            Task task = taskRepository.findById(id)
                                      .orElseThrow(() -> new ResourceNotFoundException(
                                              Constants.ERROR_TASK_NOT_FOUND + id));

            TaskStatus oldStatus = task.getStatus();
            task.setStatus(request.getStatus());

            Task updatedTask = taskRepository.save(task);

            log.info("Task status updated successfully for id: {}", id);

            notificationService.sendTaskStatusChangedNotification(
                    updatedTask,
                    oldStatus.toString(),
                    request.getStatus().toString()
            );

            return mapToResponse(updatedTask);

        } catch (OptimisticLockingFailureException e) {
            log.warn("Optimistic locking failure for task id: {}", id);
            throw new ConcurrentModificationException(Constants.ERROR_CONCURRENT_MODIFICATION);
        }
    }

    /**
     * Delete a task.
     * Invalidates both ID cache and search cache on deletion.
     *
     * @param id the task ID
     * @throws ResourceNotFoundException if task not found
     */
    @Transactional
    public void deleteTask(Long id) {
        log.info("Deleting task with id: {}", id);

        Task task = taskRepository.findById(id)
                                  .orElseThrow(() -> new ResourceNotFoundException(
                                          Constants.ERROR_TASK_NOT_FOUND + id));

        taskRepository.delete(task);

        log.info("Task deleted successfully with id: {}", id);
    }

    /**
     * Create a pageable object with sorting.
     *
     * @param page   the page number
     * @param size   the page size
     * @param sortBy the field to sort by
     * @param order  the sort order
     * @return pageable object
     */
    private Pageable createPageable(int page, int size, String sortBy, String order) {
        int validPage = Math.max(page, Constants.DEFAULT_PAGE_NUMBER);
        int validSize = Math.clamp(size, 1, Constants.MAX_PAGE_SIZE);

        String sortField = Constants.SORT_BY_DUE_DATE;
        if (Constants.SORT_BY_PRIORITY.equalsIgnoreCase(sortBy)) {
            sortField = Constants.SORT_BY_PRIORITY;
        }

        Sort.Direction direction = Sort.Direction.ASC;
        if (Constants.SORT_ORDER_DESC.equalsIgnoreCase(order)) {
            direction = Sort.Direction.DESC;
        }

        return PageRequest.of(validPage, validSize, Sort.by(direction, sortField));
    }

    /**
     * Map Task entity to TaskResponse DTO.
     *
     * @param task the task entity
     * @return task response
     */
    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                           .id(task.getId())
                           .name(task.getName())
                           .priority(task.getPriority())
                           .dueDate(task.getDueDate())
                           .assignee(task.getAssignee())
                           .status(task.getStatus())
                           .projectId(task.getProject().getId())
                           .projectName(task.getProject().getName())
                           .createdAt(task.getCreatedAt())
                           .updatedAt(task.getUpdatedAt())
                           .build();
    }
}
