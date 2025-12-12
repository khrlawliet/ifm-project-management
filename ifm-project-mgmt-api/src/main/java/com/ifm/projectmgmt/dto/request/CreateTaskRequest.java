package com.ifm.projectmgmt.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

/**
 * DTO for creating a new task.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {

    @NotBlank(message = "Task name is required")
    @Size(max = 255, message = "Task name must not exceed 255 characters")
    private String name;

    @NotNull(message = "Priority is required")
    @Min(value = 1, message = "Priority must be between 1 and 5")
    @Max(value = 5, message = "Priority must be between 1 and 5")
    private Integer priority;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotBlank(message = "Assignee is required")
    @Email(message = "Assignee must be a valid email address")
    private String assignee;
}
