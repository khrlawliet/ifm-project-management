package com.ifm.projectmgmt.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ifm.projectmgmt.dto.request.CreateProjectRequest;
import com.ifm.projectmgmt.dto.response.ProjectResponse;
import com.ifm.projectmgmt.exception.ResourceNotFoundException;
import com.ifm.projectmgmt.service.ProjectService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for ProjectController using MockMvc.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@WebMvcTest(ProjectController.class)
@DisplayName("ProjectController MVC Tests")
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProjectService projectService;

    @Test
    @DisplayName("Should get all projects")
    void shouldGetAllProjects() throws Exception {
        // Given
        ProjectResponse project1 = ProjectResponse.builder()
                .id(1L)
                .name("Project 1")
                .description("Description 1")
                .taskCount(5L)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ProjectResponse project2 = ProjectResponse.builder()
                .id(2L)
                .name("Project 2")
                .description("Description 2")
                .taskCount(3L)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(projectService.getAllProjects()).thenReturn(List.of(project1, project2));

        // When/Then
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Project 1"))
                .andExpect(jsonPath("$[0].taskCount").value(5))
                .andExpect(jsonPath("$[1].name").value("Project 2"));
    }

    @Test
    @DisplayName("Should get project by ID")
    void shouldGetProjectById() throws Exception {
        // Given
        ProjectResponse response = ProjectResponse.builder()
                .id(1L)
                .name("Test Project")
                .description("Test Description")
                .taskCount(10L)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(projectService.getProjectById(1L)).thenReturn(response);

        // When/Then
        mockMvc.perform(get("/api/projects/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Project"))
                .andExpect(jsonPath("$.taskCount").value(10));
    }

    @Test
    @DisplayName("Should return 404 when project not found")
    void shouldReturn404WhenProjectNotFound() throws Exception {
        // Given
        when(projectService.getProjectById(999L))
                .thenThrow(new ResourceNotFoundException("Project not found with id: 999"));

        // When/Then
        mockMvc.perform(get("/api/projects/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Project not found with id: 999"));
    }

    @Test
    @DisplayName("Should create project and return 201 Created")
    void shouldCreateProjectAndReturn201() throws Exception {
        // Given
        CreateProjectRequest request = CreateProjectRequest.builder()
                .name("New Project")
                .description("New Description")
                .build();

        ProjectResponse response = ProjectResponse.builder()
                .id(1L)
                .name("New Project")
                .description("New Description")
                .taskCount(0L)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(projectService.createProject(any(CreateProjectRequest.class))).thenReturn(response);

        // When/Then
        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("New Project"))
                .andExpect(jsonPath("$.taskCount").value(0));
    }

    @Test
    @DisplayName("Should return 400 for invalid project creation request")
    void shouldReturn400ForInvalidRequest() throws Exception {
        // Given - Missing required name field
        CreateProjectRequest request = CreateProjectRequest.builder()
                .description("Description without name")
                .build();

        // When/Then
        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should delete project and return 204 No Content")
    void shouldDeleteProjectAndReturn204() throws Exception {
        // When/Then
        mockMvc.perform(delete("/api/projects/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Should return 404 when deleting non-existent project")
    void shouldReturn404WhenDeletingNonExistentProject() throws Exception {
        // Given
        doThrow(new ResourceNotFoundException("Project not found with id: 999"))
                .when(projectService).deleteProject(999L);

        // When/Then
        mockMvc.perform(delete("/api/projects/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
