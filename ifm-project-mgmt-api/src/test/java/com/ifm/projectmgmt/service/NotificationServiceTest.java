package com.ifm.projectmgmt.service;

import com.ifm.projectmgmt.entity.Project;
import com.ifm.projectmgmt.entity.Task;
import com.ifm.projectmgmt.entity.TaskStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for NotificationService async operations.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Async Tests")
class NotificationServiceTest {

    @InjectMocks
    private NotificationService notificationService;

    private Project testProject;
    private Task testTask;

    @BeforeEach
    void setUp() {
        testProject = new Project();
        testProject.setId(1L);
        testProject.setName("Test Project");
        testProject.setDescription("Test Description");
        testProject.setCreatedAt(LocalDateTime.now());
        testProject.setUpdatedAt(LocalDateTime.now());

        testTask = new Task();
        testTask.setId(1L);
        testTask.setName("Test Task");
        testTask.setPriority(3);
        testTask.setDueDate(LocalDate.now().plusDays(7));
        testTask.setAssignee("test@example.com");
        testTask.setStatus(TaskStatus.PENDING);
        testTask.setProject(testProject);
        testTask.setCreatedAt(LocalDateTime.now());
        testTask.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should send task created notification asynchronously")
    void shouldSendTaskCreatedNotificationAsync() throws ExecutionException, InterruptedException {
        // When
        CompletableFuture<Void> result = notificationService.sendTaskCreatedNotification(testTask);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isDone() || !result.isCancelled()).isTrue();

        // Wait for async operation to complete
        result.get();
        assertThat(result.isDone()).isTrue();
    }

    @Test
    @DisplayName("Should send task updated notification asynchronously")
    void shouldSendTaskUpdatedNotificationAsync() throws ExecutionException, InterruptedException {
        // Given
        String changes = "Priority changed from 2 to 3";

        // When
        CompletableFuture<Void> result = notificationService.sendTaskUpdatedNotification(testTask, changes);

        // Then
        assertThat(result).isNotNull();

        // Wait for async operation to complete
        result.get();
        assertThat(result.isDone()).isTrue();
    }

    @Test
    @DisplayName("Should send task status changed notification asynchronously")
    void shouldSendTaskStatusChangedNotificationAsync() throws ExecutionException, InterruptedException {
        // Given
        String oldStatus = "PENDING";
        String newStatus = "IN_PROGRESS";

        // When
        CompletableFuture<Void> result = notificationService.sendTaskStatusChangedNotification(
                testTask, oldStatus, newStatus);

        // Then
        assertThat(result).isNotNull();

        // Wait for async operation to complete
        result.get();
        assertThat(result.isDone()).isTrue();
    }

    @Test
    @DisplayName("Should handle multiple concurrent notifications")
    void shouldHandleMultipleConcurrentNotifications() throws ExecutionException, InterruptedException {
        // When - Send multiple notifications concurrently
        CompletableFuture<Void> future1 = notificationService.sendTaskCreatedNotification(testTask);
        CompletableFuture<Void> future2 = notificationService.sendTaskUpdatedNotification(testTask, "Test change");
        CompletableFuture<Void> future3 = notificationService.sendTaskStatusChangedNotification(
                testTask, "PENDING", "COMPLETED");

        // Wait for all to complete
        CompletableFuture.allOf(future1, future2, future3).get();

        // Then
        assertThat(future1.isDone()).isTrue();
        assertThat(future2.isDone()).isTrue();
        assertThat(future3.isDone()).isTrue();
    }
}
