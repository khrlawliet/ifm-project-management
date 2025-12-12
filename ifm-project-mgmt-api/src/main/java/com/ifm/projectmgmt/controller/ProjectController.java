package com.ifm.projectmgmt.controller;

import com.ifm.projectmgmt.dto.request.CreateProjectRequest;
import com.ifm.projectmgmt.dto.request.UpdateProjectRequest;
import com.ifm.projectmgmt.dto.response.ProjectResponse;
import com.ifm.projectmgmt.service.ProjectService;
import com.ifm.projectmgmt.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for project management.
 * Provides endpoints for CRUD operations on projects.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(Constants.PROJECTS_PATH)
@Tag(name = "Projects", description = "Project management endpoints")
public class ProjectController {

    private final ProjectService projectService;

    /**
     * Get all projects.
     *
     * @return list of projects
     */
    @GetMapping
    @Operation(summary = "Get all projects", description = "Retrieve all projects in the system")
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        log.info("GET request to fetch all projects");

        List<ProjectResponse> projects = projectService.getAllProjects();

        return ResponseEntity.ok(projects);
    }

    /**
     * Get a project by ID.
     *
     * @param id the project ID
     * @return the project
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID", description = "Retrieve a specific project by its ID")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id) {
        log.info("GET request to fetch project with id: {}", id);

        ProjectResponse project = projectService.getProjectById(id);

        return ResponseEntity.ok(project);
    }

    /**
     * Create a new project.
     *
     * @param request the create project request
     * @return the created project
     */
    @PostMapping
    @Operation(summary = "Create a new project", description = "Create a new project in the system")
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody CreateProjectRequest request) {
        log.info("POST request to create project: {}", request.getName());

        ProjectResponse project = projectService.createProject(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }

    /**
     * Update a project.
     *
     * @param id      the project ID
     * @param request the update project request
     * @return the updated project
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update a project", description = "Update project details (supports partial updates)")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectRequest request) {

        log.info("PUT request to update project with id: {}", id);

        ProjectResponse project = projectService.updateProject(id, request);

        return ResponseEntity.ok(project);
    }

    /**
     * Delete a project by ID.
     *
     * @param id the project ID
     * @return no content
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a project", description = "Delete a project and all its tasks")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        log.info("DELETE request to delete project with id: {}", id);

        projectService.deleteProject(id);

        return ResponseEntity.noContent().build();
    }
}
