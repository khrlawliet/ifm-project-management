package com.ifm.projectmgmt.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * DTO for updating a project.
 * All fields are optional to support partial updates.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectRequest {

    @Size(max = 255, message = "Project name must not exceed 255 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
}
