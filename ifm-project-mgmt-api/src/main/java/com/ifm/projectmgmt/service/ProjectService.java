package com.ifm.projectmgmt.service;

import com.ifm.projectmgmt.dto.request.CreateProjectRequest;
import com.ifm.projectmgmt.dto.request.UpdateProjectRequest;
import com.ifm.projectmgmt.dto.response.ProjectResponse;
import com.ifm.projectmgmt.entity.Project;
import com.ifm.projectmgmt.exception.ResourceNotFoundException;
import com.ifm.projectmgmt.repository.ProjectRepository;
import com.ifm.projectmgmt.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing projects.
 * Handles business logic for project operations.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    /**
     * Get all projects.
     *
     * @return list of project responses
     */
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {
        log.debug("Fetching all projects");

        List<Project> projects = projectRepository.findAll();

        return projects.stream()
                       .map(this::mapToResponse)
                       .toList();
    }

    /**
     * Get a project by ID.
     *
     * @param id the project ID
     * @return project response
     * @throws ResourceNotFoundException if project not found
     */
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        log.debug("Fetching project with id: {}", id);

        Project project = projectRepository.findById(id)
                                           .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        return mapToResponse(project);
    }

    /**
     * Create a new project.
     *
     * @param request the create project request
     * @return created project response
     */
    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request) {
        log.info("Creating new project: {}", request.getName());

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());

        Project savedProject = projectRepository.save(project);

        log.info("Project created successfully with id: {}", savedProject.getId());

        return mapToResponse(savedProject);
    }

    /**
     * Update a project.
     * Supports partial updates - only provided fields will be updated.
     *
     * @param id      the project ID
     * @param request the update project request
     * @return updated project response
     * @throws ResourceNotFoundException if project not found
     */
    @Transactional
    public ProjectResponse updateProject(Long id, UpdateProjectRequest request) {
        log.info("Updating project with id: {}", id);

        Project project = projectRepository.findById(id)
                                           .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            project.setName(request.getName());
        }

        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }

        Project updatedProject = projectRepository.save(project);

        log.info("Project updated successfully with id: {}", id);

        return mapToResponse(updatedProject);
    }

    /**
     * Delete a project by ID.
     *
     * @param id the project ID
     * @throws ResourceNotFoundException if project not found
     */
    @Transactional
    public void deleteProject(Long id) {
        log.info("Deleting project with id: {}", id);

        Project project = projectRepository.findById(id)
                                           .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        projectRepository.delete(project);

        log.info("Project deleted successfully with id: {}", id);
    }

    /**
     * Map Project entity to ProjectResponse DTO.
     *
     * @param project the project entity
     * @return project response
     */
    private ProjectResponse mapToResponse(Project project) {
        long taskCount = taskRepository.countByProjectId(project.getId());

        return ProjectResponse.builder()
                              .id(project.getId())
                              .name(project.getName())
                              .description(project.getDescription())
                              .taskCount(taskCount)
                              .createdAt(project.getCreatedAt())
                              .updatedAt(project.getUpdatedAt())
                              .build();
    }
}
