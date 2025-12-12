package com.ifm.projectmgmt.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing a Task in the project management system.
 * Tasks belong to a specific project and have priority, due date, and status.
 * Implements optimistic locking using @Version for thread-safe updates.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Getter
@Setter
@Entity
@Table(name = "task", indexes = {
        @Index(name = "idx_project_id", columnList = "project_id"),
        @Index(name = "idx_due_date", columnList = "due_date"),
        @Index(name = "idx_priority", columnList = "priority"),
        @Index(name = "idx_status", columnList = "status")
})
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private Integer priority;

    @Column(nullable = false, name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false)
    private String assignee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.PENDING;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Version
    private Long version;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Builder method to set the project and return the task.
     *
     * @param project the project to set
     * @return this task
     */
    public Task withProject(Project project) {
        this.project = project;
        return this;
    }
}
