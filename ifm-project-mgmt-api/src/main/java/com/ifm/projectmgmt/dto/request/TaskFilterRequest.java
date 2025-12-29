package com.ifm.projectmgmt.dto.request;

import com.ifm.projectmgmt.entity.TaskStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskFilterRequest {

    private TaskStatus status;

    @Size(max = 255, message = "Task name filter must not exceed 255 characters")
    private String taskName;

    private LocalDate startDate;

    private LocalDate endDate;

    @Pattern(regexp = "^(priority|dueDate)$", message = "Sort by must be either 'priority' or 'dueDate'")
    private String sortBy;

    @Pattern(regexp = "^(asc|desc)$", message = "Sort order must be either 'asc' or 'desc'")
    private String order;

    @Min(value = 0, message = "Page number must be non-negative")
    private int page;

    @Min(value = 1, message = "Page size must be at least 1")
    @Max(value = 100, message = "Page size must not exceed 100")
    private int size;
}
