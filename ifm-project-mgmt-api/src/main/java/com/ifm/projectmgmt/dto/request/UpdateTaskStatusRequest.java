package com.ifm.projectmgmt.dto.request;

import com.ifm.projectmgmt.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO for updating task status only.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskStatusRequest {

    @NotNull(message = "Status is required")
    private TaskStatus status;
}
