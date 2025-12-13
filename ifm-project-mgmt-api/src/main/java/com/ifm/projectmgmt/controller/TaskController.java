package com.ifm.projectmgmt.controller;

import com.ifm.projectmgmt.dto.request.CreateTaskRequest;
import com.ifm.projectmgmt.dto.request.UpdateTaskRequest;
import com.ifm.projectmgmt.dto.request.UpdateTaskStatusRequest;
import com.ifm.projectmgmt.dto.response.PagedResponse;
import com.ifm.projectmgmt.dto.response.TaskResponse;
import com.ifm.projectmgmt.entity.TaskStatus;
import com.ifm.projectmgmt.service.TaskService;
import com.ifm.projectmgmt.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * REST Controller for task management.
 * Provides endpoints for CRUD operations on tasks with filtering, sorting, and pagination.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Slf4j
@Tag(name = "Tasks", description = "Task management endpoints")
@RestController
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * Get all tasks with optional filters and sorting.
     *
     * @param status    the status filter (optional)
     * @param taskName  the task name filter for search/auto-suggest (optional, partial match)
     * @param startDate the start date filter (optional)
     * @param endDate   the end date filter (optional)
     * @param sortBy    the field to sort by (priority or dueDate)
     * @param order     the sort order (asc or desc)
     * @param page      the page number
     * @param size      the page size
     * @return paged list of all tasks
     */
    @GetMapping(Constants.TASKS_PATH)
    @Operation(
            summary = "Get all tasks",
            description = "Retrieve all tasks across all projects with optional status, task name (for auto-suggest), date range filter, sorting, and pagination. Task name search is cached for 5 minutes."
    )
    public ResponseEntity<PagedResponse<TaskResponse>> getAllTasks(
            @Parameter(description = "Status filter (PENDING, IN_PROGRESS, COMPLETED)")
            @RequestParam(required = false)
            TaskStatus status,

            @Parameter(description = "Task name filter for search/auto-suggest (partial match, case-insensitive)")
            @RequestParam(required = false)
            String taskName,

            @Parameter(description = "Start date for filtering (yyyy-MM-dd)")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @Parameter(description = "End date for filtering (yyyy-MM-dd)")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            @Parameter(description = "Field to sort by (priority or dueDate)")
            @RequestParam(defaultValue = Constants.SORT_BY_DUE_DATE)
            String sortBy,

            @Parameter(description = "Sort order (asc or desc)")
            @RequestParam(defaultValue = Constants.SORT_ORDER_ASC)
            String order,

            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0")
            int page,

            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20")
            int size) {

        log.info("GET request to fetch all tasks with filters - status: {}, taskName: {}", status, taskName);

        PagedResponse<TaskResponse> tasks = taskService.getAllTasks(
                status, taskName, startDate, endDate, sortBy, order, page, size
        );

        return ResponseEntity.ok(tasks);
    }

    /**
     * Create a new task for a project.
     *
     * @param projectId the project ID
     * @param request   the create task request
     * @return the created task
     */
    @PostMapping(Constants.PROJECTS_PATH + "/{projectId}/tasks")
    @Operation(summary = "Create a new task", description = "Create a new task for a specific project")
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateTaskRequest request) {

        log.info("POST request to create task for project id: {}", projectId);

        TaskResponse task = taskService.createTask(projectId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(task);
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
     * @return paged list of tasks
     */
    @GetMapping(Constants.PROJECTS_PATH + "/{projectId}/tasks")
    @Operation(
            summary = "Get tasks for a project",
            description = "Retrieve tasks for a project with optional date range filter, sorting, and pagination"
    )
    public ResponseEntity<PagedResponse<TaskResponse>> getTasksForProject(
            @PathVariable Long projectId,

            @Parameter(description = "Start date for filtering (yyyy-MM-dd)")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @Parameter(description = "End date for filtering (yyyy-MM-dd)")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            @Parameter(description = "Field to sort by (priority or dueDate)")
            @RequestParam(defaultValue = Constants.SORT_BY_DUE_DATE)
            String sortBy,

            @Parameter(description = "Sort order (asc or desc)")
            @RequestParam(defaultValue = Constants.SORT_ORDER_ASC)
            String order,

            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0")
            int page,

            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20")
            int size) {

        log.info("GET request to fetch tasks for project id: {}", projectId);

        PagedResponse<TaskResponse> tasks = taskService.getTasksForProject(
                projectId, startDate, endDate, sortBy, order, page, size
        );

        return ResponseEntity.ok(tasks);
    }

    /**
     * Get a task by ID.
     *
     * @param id the task ID
     * @return the task
     */
    @GetMapping(Constants.TASKS_PATH + "/{id}")
    @Operation(summary = "Get task by ID", description = "Retrieve a specific task by its ID")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        log.info("GET request to fetch task with id: {}", id);

        TaskResponse task = taskService.getTaskById(id);

        return ResponseEntity.ok(task);
    }

    /**
     * Update a task.
     *
     * @param id      the task ID
     * @param request the update task request
     * @return the updated task
     */
    @PutMapping(Constants.TASKS_PATH + "/{id}")
    @Operation(summary = "Update a task", description = "Update task details (supports partial updates)")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request) {

        log.info("PUT request to update task with id: {}", id);

        TaskResponse task = taskService.updateTask(id, request);

        return ResponseEntity.ok(task);
    }

    /**
     * Update task status only.
     *
     * @param id      the task ID
     * @param request the update status request
     * @return the updated task
     */
    @PatchMapping(Constants.TASKS_PATH + "/{id}/status")
    @Operation(summary = "Update task status", description = "Update only the status of a task")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskStatusRequest request) {

        log.info("PATCH request to update task status with id: {}", id);

        TaskResponse task = taskService.updateTaskStatus(id, request);

        return ResponseEntity.ok(task);
    }

    /**
     * Delete a task by ID.
     *
     * @param id the task ID
     * @return no content
     */
    @DeleteMapping(Constants.TASKS_PATH + "/{id}")
    @Operation(summary = "Delete a task", description = "Delete a task by its ID")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        log.info("DELETE request to delete task with id: {}", id);

        taskService.deleteTask(id);

        return ResponseEntity.noContent().build();
    }
}
