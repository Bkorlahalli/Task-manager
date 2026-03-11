package com.taskmanager.dto;

import com.taskmanager.entity.Task.TaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Task create/update request")
public class TaskRequest {

    @NotBlank(message = "Title is required")
    @Schema(description = "Task title", example = "Implement API")
    private String title;

    @Schema(description = "Task description", example = "Implement REST API for tasks")
    private String description;

    @NotNull(message = "Status is required")
    @Schema(description = "Task status", example = "TODO")
    private TaskStatus status;
}
