package com.ifm.projectmgmt.service;

import com.ifm.projectmgmt.dto.request.CreateProjectRequest;
import com.ifm.projectmgmt.dto.response.ProjectResponse;
import com.ifm.projectmgmt.entity.Project;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ProjectService.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ProjectService Unit Tests")
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private ProjectService projectService;

    private Project testProject;

    @BeforeEach
    void setUp() {
        testProject = new Project();
        testProject.setId(1L);
        testProject.setName("Test Project");
        testProject.setDescription("Test Description");
        testProject.setCreatedAt(LocalDateTime.now());
        testProject.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should get all projects successfully")
    void shouldGetAllProjectsSuccessfully() {
        // Given
        List<Project> projects = List.of(testProject);
        when(projectRepository.findAll()).thenReturn(projects);
        when(taskRepository.countByProjectId(1L)).thenReturn(5L);

        // When
        List<ProjectResponse> responses = projectService.getAllProjects();

        // Then
        assertThat(responses).isNotNull();
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getName()).isEqualTo("Test Project");
        assertThat(responses.get(0).getTaskCount()).isEqualTo(5L);

        verify(projectRepository).findAll();
        verify(taskRepository).countByProjectId(1L);
    }

    @Test
    @DisplayName("Should get project by ID successfully")
    void shouldGetProjectByIdSuccessfully() {
        // Given
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(taskRepository.countByProjectId(1L)).thenReturn(3L);

        // When
        ProjectResponse response = projectService.getProjectById(1L);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Test Project");
        assertThat(response.getTaskCount()).isEqualTo(3L);

        verify(projectRepository).findById(1L);
        verify(taskRepository).countByProjectId(1L);
    }

    @Test
    @DisplayName("Should throw exception when project not found")
    void shouldThrowExceptionWhenProjectNotFound() {
        // Given
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> projectService.getProjectById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Project not found with id: 999");

        verify(projectRepository).findById(999L);
        verify(taskRepository, never()).countByProjectId(anyLong());
    }

    @Test
    @DisplayName("Should create project successfully")
    void shouldCreateProjectSuccessfully() {
        // Given
        CreateProjectRequest request = CreateProjectRequest.builder()
                .name("New Project")
                .description("New Description")
                .build();

        when(projectRepository.save(any(Project.class))).thenReturn(testProject);
        when(taskRepository.countByProjectId(1L)).thenReturn(0L);

        // When
        ProjectResponse response = projectService.createProject(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Test Project");
        assertThat(response.getTaskCount()).isEqualTo(0L);

        verify(projectRepository).save(any(Project.class));
        verify(taskRepository).countByProjectId(1L);
    }

    @Test
    @DisplayName("Should delete project successfully")
    void shouldDeleteProjectSuccessfully() {
        // Given
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        doNothing().when(projectRepository).delete(any(Project.class));

        // When
        projectService.deleteProject(1L);

        // Then
        verify(projectRepository).findById(1L);
        verify(projectRepository).delete(testProject);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent project")
    void shouldThrowExceptionWhenDeletingNonExistentProject() {
        // Given
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> projectService.deleteProject(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Project not found with id: 999");

        verify(projectRepository).findById(999L);
        verify(projectRepository, never()).delete(any());
    }
}
