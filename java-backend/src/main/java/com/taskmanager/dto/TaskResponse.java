package com.taskmanager.dto;

import com.taskmanager.entity.Task;
import com.taskmanager.entity.Task.TaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
@Schema(description = "Task response")
public class TaskResponse {

    @Schema(description = "Task ID")
    private Long id;

    @Schema(description = "Task title")
    private String title;

    @Schema(description = "Task description")
    private String description;

    @Schema(description = "Task status")
    private TaskStatus status;

    @Schema(description = "Creation timestamp")
    private Instant createdAt;

    public static TaskResponse fromEntity(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .createdAt(task.getCreatedAt())
                .build();
    }
}
