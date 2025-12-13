package com.ifm.projectmgmt.repository;

import com.ifm.projectmgmt.entity.Task;
import com.ifm.projectmgmt.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for Task entity.
 * Provides CRUD operations and custom queries for tasks with filtering and sorting.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Find all tasks for a specific project.
     *
     * @param projectId the project ID
     * @param pageable  pagination and sorting information
     * @return page of tasks
     */
    Page<Task> findByProjectId(Long projectId, Pageable pageable);

    /**
     * Find tasks by project ID within a date range.
     *
     * @param projectId the project ID
     * @param startDate the start date (inclusive)
     * @param endDate   the end date (inclusive)
     * @param pageable  pagination and sorting information
     * @return page of tasks
     */
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId " +
           "AND t.dueDate >= :startDate AND t.dueDate <= :endDate")
    Page<Task> findByProjectIdAndDueDateBetween(
            @Param("projectId") Long projectId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    /**
     * Find tasks by project ID with optional date range filter.
     *
     * @param projectId the project ID
     * @param startDate the start date (inclusive), can be null
     * @param endDate   the end date (inclusive), can be null
     * @param pageable  pagination and sorting information
     * @return page of tasks
     */
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId " +
           "AND (:startDate IS NULL OR t.dueDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.dueDate <= :endDate)")
    Page<Task> findByProjectIdWithOptionalDateRange(
            @Param("projectId") Long projectId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    /**
     * Find all tasks by status.
     *
     * @param status   the task status
     * @param pageable pagination and sorting information
     * @return page of tasks
     */
    Page<Task> findByStatus(TaskStatus status, Pageable pageable);

    /**
     * Find tasks by assignee email.
     *
     * @param assignee the assignee email
     * @param pageable pagination and sorting information
     * @return page of tasks
     */
    Page<Task> findByAssignee(String assignee, Pageable pageable);

    /**
     * Count tasks by project ID.
     *
     * @param projectId the project ID
     * @return number of tasks
     */
    long countByProjectId(Long projectId);

    /**
     * Find all tasks with due date before a specific date.
     *
     * @param date the date to compare
     * @return list of overdue tasks
     */
    List<Task> findByDueDateBeforeAndStatusNot(LocalDate date, TaskStatus status);

    /**
     * Find all tasks with optional date range filter.
     *
     * @param startDate the start date (inclusive), can be null
     * @param endDate   the end date (inclusive), can be null
     * @param pageable  pagination and sorting information
     * @return page of tasks
     */
    @Query("SELECT t FROM Task t WHERE " +
           "(:startDate IS NULL OR t.dueDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.dueDate <= :endDate)")
    Page<Task> findAllWithOptionalDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    /**
     * Find all tasks with optional status, date range, and name filters.
     *
     * @param status    the task status, can be null
     * @param taskName  the task name filter (partial match), can be null
     * @param startDate the start date (inclusive), can be null
     * @param endDate   the end date (inclusive), can be null
     * @param pageable  pagination and sorting information
     * @return page of tasks
     */
    @Query("SELECT t FROM Task t WHERE " +
           "(:status IS NULL OR t.status = :status) " +
           "AND (:taskName IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :taskName, '%'))) " +
           "AND (:startDate IS NULL OR t.dueDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.dueDate <= :endDate)")
    Page<Task> findAllWithOptionalFilters(
            @Param("status") TaskStatus status,
            @Param("taskName") String taskName,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );
}
