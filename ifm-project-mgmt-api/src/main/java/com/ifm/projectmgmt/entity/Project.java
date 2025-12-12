package com.ifm.projectmgmt.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a Project in the project management system.
 * A project can contain multiple tasks.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "project")
@EntityListeners(AuditingEntityListener.class)
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();

    /**
     * Helper method to add a task to this project.
     *
     * @param task the task to add
     */
    public void addTask(Task task) {
        tasks.add(task);
        task.setProject(this);
    }

    /**
     * Helper method to remove a task from this project.
     *
     * @param task the task to remove
     */
    public void removeTask(Task task) {
        tasks.remove(task);
        task.setProject(null);
    }
}
