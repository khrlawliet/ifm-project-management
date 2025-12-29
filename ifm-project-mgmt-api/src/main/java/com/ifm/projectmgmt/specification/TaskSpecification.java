package com.ifm.projectmgmt.specification;

import com.ifm.projectmgmt.entity.Task;
import com.ifm.projectmgmt.entity.TaskStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

/**
 * Specification utility for building dynamic Task queries.
 * Provides reusable criteria for filtering tasks.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
public class TaskSpecification {

    private TaskSpecification() {
        // Private constructor to prevent instantiation
    }

    /**
     * Filter tasks by status.
     *
     * @param status the task status
     * @return specification for status filter
     */
    public static Specification<Task> hasStatus(TaskStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    /**
     * Filter tasks by name (case-insensitive partial match).
     *
     * @param taskName the task name to search for
     * @return specification for name filter
     */
    public static Specification<Task> hasNameContaining(String taskName) {
        return (root, query, criteriaBuilder) -> {
            if (taskName == null || taskName.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")),
                    "%" + taskName.toLowerCase() + "%"
            );
        };
    }

    /**
     * Filter tasks with due date on or after the start date.
     *
     * @param startDate the start date (inclusive)
     * @return specification for start date filter
     */
    public static Specification<Task> hasDueDateAfter(LocalDate startDate) {
        return (root, query, criteriaBuilder) -> {
            if (startDate == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("dueDate"), startDate);
        };
    }

    /**
     * Filter tasks with due date on or before the end date.
     *
     * @param endDate the end date (inclusive)
     * @return specification for end date filter
     */
    public static Specification<Task> hasDueDateBefore(LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            if (endDate == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("dueDate"), endDate);
        };
    }

    /**
     * Filter tasks by project ID.
     *
     * @param projectId the project ID
     * @return specification for project filter
     */
    public static Specification<Task> belongsToProject(Long projectId) {
        return (root, query, criteriaBuilder) -> {
            if (projectId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("project").get("id"), projectId);
        };
    }

    /**
     * Filter tasks by assignee.
     *
     * @param assignee the assignee email
     * @return specification for assignee filter
     */
    public static Specification<Task> hasAssignee(String assignee) {
        return (root, query, criteriaBuilder) -> {
            if (assignee == null || assignee.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("assignee"), assignee);
        };
    }

    /**
     * Combine multiple specifications with AND logic.
     * Convenience method for common filter combinations.
     *
     * @param status    the task status
     * @param taskName  the task name filter
     * @param startDate the start date
     * @param endDate   the end date
     * @return combined specification
     */
    public static Specification<Task> withFilters(
            TaskStatus status,
            String taskName,
            LocalDate startDate,
            LocalDate endDate
    ) {
        return Specification.where(hasStatus(status))
                .and(hasNameContaining(taskName))
                .and(hasDueDateAfter(startDate))
                .and(hasDueDateBefore(endDate));
    }
}
