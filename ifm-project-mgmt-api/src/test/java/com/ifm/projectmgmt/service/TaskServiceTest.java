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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TaskService.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TaskService Unit Tests")
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TaskService taskService;

    private Project testProject;
    private Task testTask;

    @BeforeEach
    void setUp() {
        testProject = new Project();
        testProject.setId(1L);
        testProject.setName("Test Project");
        testProject.setDescription("Test Description");
        testProject.setCreatedAt(LocalDateTime.now());
        testProject.setUpdatedAt(LocalDateTime.now());

        testTask = new Task();
        testTask.setId(1L);
        testTask.setName("Test Task");
        testTask.setPriority(3);
        testTask.setDueDate(LocalDate.now().plusDays(7));
        testTask.setAssignee("test@example.com");
        testTask.setStatus(TaskStatus.PENDING);
        testTask.setProject(testProject);
        testTask.setVersion(0L);
        testTask.setCreatedAt(LocalDateTime.now());
        testTask.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should create task successfully")
    void shouldCreateTaskSuccessfully() {
        // Given
        CreateTaskRequest request = CreateTaskRequest.builder()
                                                     .name("New Task")
                                                     .priority(2)
                                                     .dueDate(LocalDate.now().plusDays(5))
                                                     .assignee("test@example.com")
                                                     .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // When
        TaskResponse response = taskService.createTask(1L, request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo(testTask.getName());
        assertThat(response.getStatus()).isEqualTo(TaskStatus.PENDING);
        assertThat(response.getProjectId()).isEqualTo(1L);

        verify(projectRepository).findById(1L);
        verify(taskRepository).save(any(Task.class));
        verify(notificationService).sendTaskCreatedNotification(any(Task.class));
    }

    @Test
    @DisplayName("Should throw exception when project not found")
    void shouldThrowExceptionWhenProjectNotFound() {
        // Given
        CreateTaskRequest request = CreateTaskRequest.builder()
                                                     .name("New Task")
                                                     .priority(2)
                                                     .dueDate(LocalDate.now().plusDays(5))
                                                     .assignee("test@example.com")
                                                     .build();

        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> taskService.createTask(999L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Project not found");

        verify(projectRepository).findById(999L);
        verify(taskRepository, never()).save(any());
        verify(notificationService, never()).sendTaskCreatedNotification(any());
    }

    @Test
    @DisplayName("Should get task by ID successfully")
    void shouldGetTaskByIdSuccessfully() {
        // Given
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        // When
        TaskResponse response = taskService.getTaskById(1L);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Test Task");

        verify(taskRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when task not found")
    void shouldThrowExceptionWhenTaskNotFound() {
        // Given
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> taskService.getTaskById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Task not found");

        verify(taskRepository).findById(999L);
    }

    @Test
    @DisplayName("Should get tasks for project with filters")
    void shouldGetTasksForProjectWithFilters() {
        // Given
        Page<Task> taskPage = new PageImpl<>(List.of(testTask));
        when(projectRepository.existsById(1L)).thenReturn(true);
        when(taskRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(taskPage);

        // When
        PagedResponse<TaskResponse> response = taskService.getTasksForProject(
                1L,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                "priority",
                "asc",
                0,
                20
        );

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getTotalElements()).isEqualTo(1);

        verify(projectRepository).existsById(1L);
        verify(taskRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @DisplayName("Should throw exception for invalid date range")
    void shouldThrowExceptionForInvalidDateRange() {
        // Given
        when(projectRepository.existsById(1L)).thenReturn(true);

        LocalDate startDate = LocalDate.now().plusDays(10);
        LocalDate endDate = LocalDate.now();

        // When/Then
        assertThatThrownBy(() -> taskService.getTasksForProject(
                1L, startDate, endDate, "priority", "asc", 0, 20
        ))
                .isInstanceOf(InvalidInputException.class)
                .hasMessageContaining("Start date must be before end date");

        verify(projectRepository).existsById(1L);
        verify(taskRepository, never()).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @DisplayName("Should update task successfully")
    void shouldUpdateTaskSuccessfully() {
        // Given
        UpdateTaskRequest request = UpdateTaskRequest.builder()
                                                     .name("Updated Task")
                                                     .priority(5)
                                                     .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // When
        TaskResponse response = taskService.updateTask(1L, request);

        // Then
        assertThat(response).isNotNull();
        verify(taskRepository).findById(1L);
        verify(taskRepository).save(any(Task.class));
        verify(notificationService).sendTaskUpdatedNotification(any(Task.class), anyString());
    }

    @Test
    @DisplayName("Should update task status successfully")
    void shouldUpdateTaskStatusSuccessfully() {
        // Given
        UpdateTaskStatusRequest request = UpdateTaskStatusRequest.builder()
                                                                 .status(TaskStatus.IN_PROGRESS)
                                                                 .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // When
        TaskResponse response = taskService.updateTaskStatus(1L, request);

        // Then
        assertThat(response).isNotNull();
        verify(taskRepository).findById(1L);
        verify(taskRepository).save(any(Task.class));
        verify(notificationService).sendTaskStatusChangedNotification(any(Task.class), anyString(), anyString());
    }

    @Test
    @DisplayName("Should handle optimistic locking failure")
    void shouldHandleOptimisticLockingFailure() {
        // Given
        UpdateTaskStatusRequest request = UpdateTaskStatusRequest.builder()
                                                                 .status(TaskStatus.IN_PROGRESS)
                                                                 .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class)))
                .thenThrow(new OptimisticLockingFailureException("Concurrent modification"));

        // When/Then
        assertThatThrownBy(() -> taskService.updateTaskStatus(1L, request))
                .isInstanceOf(ConcurrentModificationException.class)
                .hasMessageContaining("Task was modified by another process");

        verify(taskRepository).findById(1L);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("Should delete task successfully")
    void shouldDeleteTaskSuccessfully() {
        // Given
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        doNothing().when(taskRepository).delete(any(Task.class));

        // When
        taskService.deleteTask(1L);

        // Then
        verify(taskRepository).findById(1L);
        verify(taskRepository).delete(testTask);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent task")
    void shouldThrowExceptionWhenDeletingNonExistentTask() {
        // Given
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> taskService.deleteTask(999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(taskRepository).findById(999L);
        verify(taskRepository, never()).delete(any(Task.class));
    }
}
