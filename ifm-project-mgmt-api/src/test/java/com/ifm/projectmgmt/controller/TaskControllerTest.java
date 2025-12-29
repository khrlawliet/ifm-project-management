package com.ifm.projectmgmt.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ifm.projectmgmt.dto.request.CreateTaskRequest;
import com.ifm.projectmgmt.dto.request.UpdateTaskStatusRequest;
import com.ifm.projectmgmt.dto.response.PagedResponse;
import com.ifm.projectmgmt.dto.response.TaskResponse;
import com.ifm.projectmgmt.entity.TaskStatus;
import com.ifm.projectmgmt.exception.ResourceNotFoundException;
import com.ifm.projectmgmt.service.TaskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for TaskController using MockMvc.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@WebMvcTest(TaskController.class)
@DisplayName("TaskController MVC Tests")
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TaskService taskService;

    @Test
    @DisplayName("Should create task and return 201 Created")
    void shouldCreateTaskAndReturn201() throws Exception {
        // Given
        CreateTaskRequest request = CreateTaskRequest.builder()
                .name("New Task")
                .priority(3)
                .dueDate(LocalDate.now().plusDays(7))
                .assignee("test@example.com")
                .build();

        TaskResponse response = TaskResponse.builder()
                .id(1L)
                .name("New Task")
                .priority(3)
                .dueDate(LocalDate.now().plusDays(7))
                .assignee("test@example.com")
                .status(TaskStatus.PENDING)
                .projectId(1L)
                .projectName("Test Project")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(taskService.createTask(eq(1L), any(CreateTaskRequest.class))).thenReturn(response);

        // When/Then
        mockMvc.perform(post("/api/projects/1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("New Task"))
                .andExpect(jsonPath("$.priority").value(3))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.assignee").value("test@example.com"));
    }

    @Test
    @DisplayName("Should return 400 for invalid task creation request")
    void shouldReturn400ForInvalidRequest() throws Exception {
        // Given - Missing required fields
        CreateTaskRequest request = CreateTaskRequest.builder()
                .priority(3)
                .build();

        // When/Then
        mockMvc.perform(post("/api/projects/1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should get tasks for project with filters")
    void shouldGetTasksForProjectWithFilters() throws Exception {
        // Given
        TaskResponse taskResponse = TaskResponse.builder()
                .id(1L)
                .name("Test Task")
                .priority(2)
                .dueDate(LocalDate.now().plusDays(5))
                .assignee("test@example.com")
                .status(TaskStatus.IN_PROGRESS)
                .projectId(1L)
                .projectName("Test Project")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        PagedResponse<TaskResponse> pagedResponse = PagedResponse.<TaskResponse>builder()
                .content(List.of(taskResponse))
                .totalElements(1L)
                .totalPages(1)
                .currentPage(0)
                .pageSize(20)
                .first(true)
                .last(true)
                .empty(false)
                .build();

        when(taskService.getTasksForProject(
                anyLong(), any(), any(), anyString(), anyString(), anyInt(), anyInt()
        )).thenReturn(pagedResponse);

        // When/Then
        mockMvc.perform(get("/api/projects/1/tasks")
                        .param("sortBy", "priority")
                        .param("order", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Test Task"));
    }

    @Test
    @DisplayName("Should get task by ID")
    void shouldGetTaskById() throws Exception {
        // Given
        TaskResponse response = TaskResponse.builder()
                .id(1L)
                .name("Test Task")
                .priority(2)
                .dueDate(LocalDate.now())
                .assignee("test@example.com")
                .status(TaskStatus.PENDING)
                .projectId(1L)
                .projectName("Test Project")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(taskService.getTaskById(1L)).thenReturn(response);

        // When/Then
        mockMvc.perform(get("/api/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Task"))
                .andExpect(jsonPath("$.priority").value(2));
    }

    @Test
    @DisplayName("Should return 404 when task not found")
    void shouldReturn404WhenTaskNotFound() throws Exception {
        // Given
        when(taskService.getTaskById(999L))
                .thenThrow(new ResourceNotFoundException("Task not found with id: 999"));

        // When/Then
        mockMvc.perform(get("/api/tasks/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Task not found with id: 999"));
    }

    @Test
    @DisplayName("Should update task status")
    void shouldUpdateTaskStatus() throws Exception {
        // Given
        UpdateTaskStatusRequest request = UpdateTaskStatusRequest.builder()
                .status(TaskStatus.COMPLETED)
                .build();

        TaskResponse response = TaskResponse.builder()
                .id(1L)
                .name("Test Task")
                .priority(2)
                .dueDate(LocalDate.now())
                .assignee("test@example.com")
                .status(TaskStatus.COMPLETED)
                .projectId(1L)
                .projectName("Test Project")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(taskService.updateTaskStatus(eq(1L), any(UpdateTaskStatusRequest.class))).thenReturn(response);

        // When/Then
        mockMvc.perform(patch("/api/tasks/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    @DisplayName("Should delete task and return 204 No Content")
    void shouldDeleteTaskAndReturn204() throws Exception {
        // When/Then
        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Should validate priority range")
    void shouldValidatePriorityRange() throws Exception {
        // Given - Priority out of range
        CreateTaskRequest request = CreateTaskRequest.builder()
                .name("Invalid Task")
                .priority(10) // Invalid - should be 1-5
                .dueDate(LocalDate.now().plusDays(7))
                .assignee("test@example.com")
                .build();

        // When/Then
        mockMvc.perform(post("/api/projects/1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should validate email format")
    void shouldValidateEmailFormat() throws Exception {
        // Given - Invalid email
        CreateTaskRequest request = CreateTaskRequest.builder()
                .name("Test Task")
                .priority(3)
                .dueDate(LocalDate.now().plusDays(7))
                .assignee("invalid-email") // Invalid email format
                .build();

        // When/Then
        mockMvc.perform(post("/api/projects/1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 for invalid enum value in request parameter")
    void shouldReturn400ForInvalidEnumInRequestParameter() throws Exception {
        // When/Then - Invalid status value "DONE" instead of valid enum values
        mockMvc.perform(get("/api/tasks")
                        .param("status", "DONE"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(containsString("Invalid value 'DONE' for parameter 'status'")))
                .andExpect(jsonPath("$.message").value(containsString("PENDING, IN_PROGRESS, COMPLETED")));
    }

    @Test
    @DisplayName("Should return 400 for invalid enum value in request body")
    void shouldReturn400ForInvalidEnumInRequestBody() throws Exception {
        // Given - Invalid status in JSON body
        String invalidJson = """
                {
                    "status": "DONE"
                }
                """;

        // When/Then
        mockMvc.perform(patch("/api/tasks/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(containsString("Invalid value 'DONE' for field 'status'")))
                .andExpect(jsonPath("$.message").value(containsString("PENDING, IN_PROGRESS, COMPLETED")));
    }
}
