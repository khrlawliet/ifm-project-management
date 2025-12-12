package com.ifm.projectmgmt.repository;

import com.ifm.projectmgmt.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Project entity.
 * Provides CRUD operations and custom queries for projects.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * Find a project by its name.
     *
     * @param name the name of the project
     * @return optional containing the project if found
     */
    Optional<Project> findByName(String name);

    /**
     * Check if a project exists by name.
     *
     * @param name the name of the project
     * @return true if exists, false otherwise
     */
    boolean existsByName(String name);
}
