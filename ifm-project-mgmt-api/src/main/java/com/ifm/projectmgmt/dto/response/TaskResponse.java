package com.ifm.projectmgmt.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ifm.projectmgmt.entity.TaskStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for task response.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private Long id;

    private String name;

    private Integer priority;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    private String assignee;

    private TaskStatus status;

    private Long projectId;

    private String projectName;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
