package com.ifm.projectmgmt.dto.request;

import com.ifm.projectmgmt.entity.TaskStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

/**
 * DTO for updating an existing task.
 * All fields are optional to allow partial updates.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {

    @Size(max = 255, message = "Task name must not exceed 255 characters")
    private String name;

    @Min(value = 1, message = "Priority must be between 1 and 5")
    @Max(value = 5, message = "Priority must be between 1 and 5")
    private Integer priority;

    private LocalDate dueDate;

    @Email(message = "Assignee must be a valid email address")
    private String assignee;

    private TaskStatus status;
}
