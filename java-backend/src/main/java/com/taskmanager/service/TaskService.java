package com.taskmanager.service;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.Task;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private static final String TASKS_CACHE = "tasks";

    private final TaskRepository taskRepository;

    @CacheEvict(value = TASKS_CACHE, key = "'all'")
    public TaskResponse create(TaskRequest request) {
        log.debug("Creating task: {}", request.getTitle());
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .build();
        task = taskRepository.save(task);
        return TaskResponse.fromEntity(task);
    }

    @Cacheable(value = TASKS_CACHE, key = "'all'")
    public List<TaskResponse> findAll() {
        log.debug("Fetching all tasks from database");
        return taskRepository.findAll().stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public TaskResponse findById(Long id) {
        return taskRepository.findById(id)
                .map(TaskResponse::fromEntity)
                .orElseThrow(() -> new RuntimeException("Task not found: " + id));
    }

    @CacheEvict(value = TASKS_CACHE, key = "'all'")
    public TaskResponse update(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found: " + id));
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task = taskRepository.save(task);
        return TaskResponse.fromEntity(task);
    }

    @CacheEvict(value = TASKS_CACHE, key = "'all'")
    public void delete(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Task not found: " + id);
        }
        taskRepository.deleteById(id);
        log.debug("Deleted task: {}", id);
    }
}
