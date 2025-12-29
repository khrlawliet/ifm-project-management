package com.ifm.projectmgmt.concurrency;

import com.ifm.projectmgmt.entity.Project;
import com.ifm.projectmgmt.entity.Task;
import com.ifm.projectmgmt.entity.TaskStatus;
import com.ifm.projectmgmt.repository.ProjectRepository;
import com.ifm.projectmgmt.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for concurrent task updates using optimistic locking.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@SpringBootTest
@TestPropertySource(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false"
})
@DisplayName("Task Concurrency Tests - Optimistic Locking")
class TaskConcurrencyTest {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    private Project testProject;

    @BeforeEach
    @Transactional
    void setUp() {
        // Clean up
        taskRepository.deleteAll();
        projectRepository.deleteAll();

        // Create test project
        testProject = new Project();
        testProject.setName("Concurrency Test Project");
        testProject.setDescription("Testing concurrent modifications");
        testProject = projectRepository.saveAndFlush(testProject);
    }

    @Test
    @DisplayName("Should detect concurrent modification with optimistic locking")
    void shouldDetectConcurrentModification() {
        // Given - Create a task
        Task task = createAndSaveTask("Concurrent Task", 3);

        // When - Simulate two concurrent updates
        Task task1 = taskRepository.findById(task.getId()).orElseThrow();
        Task task2 = taskRepository.findById(task.getId()).orElseThrow();

        // Modify and save first instance
        task1.setStatus(TaskStatus.IN_PROGRESS);
        taskRepository.saveAndFlush(task1);

        // Try to modify and save second instance (should fail with OptimisticLockingFailureException)
        task2.setStatus(TaskStatus.COMPLETED);

        // Then
        boolean exceptionThrown = false;
        try {
            taskRepository.saveAndFlush(task2);
        } catch (OptimisticLockingFailureException e) {
            exceptionThrown = true;
        }

        assertThat(exceptionThrown).isTrue();

        // Verify the first update succeeded
        Task finalTask = taskRepository.findById(task.getId()).orElseThrow();
        assertThat(finalTask.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
        assertThat(finalTask.getVersion()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should handle multiple concurrent status updates")
    void shouldHandleMultipleConcurrentUpdates() throws InterruptedException, ExecutionException {
        // Given - Create a task
        Task task = createAndSaveTask("Multi-Concurrent Task", 2);
        Long taskId = task.getId();

        // When - Attempt 10 concurrent updates
        ExecutorService executor = Executors.newFixedThreadPool(10);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();

        for (int i = 0; i < 10; i++) {
            final int attemptNumber = i;
            Future<?> future = executor.submit(() -> {
                try {
                    Task t = taskRepository.findById(taskId).orElseThrow();
                    t.setPriority((attemptNumber % 5) + 1);
                    t.setName("Updated Task " + attemptNumber);
                    taskRepository.saveAndFlush(t);
                    successCount.incrementAndGet();
                } catch (OptimisticLockingFailureException e) {
                    failureCount.incrementAndGet();
                }
            });
            futures.add(future);
        }

        // Wait for all threads to complete
        for (Future<?> future : futures) {
            future.get();
        }
        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        // Then
        assertThat(successCount.get()).isGreaterThan(0);
        assertThat(failureCount.get()).isGreaterThan(0);
        assertThat(successCount.get() + failureCount.get()).isEqualTo(10);

        // Verify final state
        Task finalTask = taskRepository.findById(taskId).orElseThrow();
        assertThat(finalTask.getVersion()).isEqualTo((long) successCount.get());
    }

    @Test
    @DisplayName("Should successfully retry after optimistic locking failure")
    void shouldSuccessfullyRetryAfterOptimisticLockingFailure() {
        // Given
        Task task = createAndSaveTask("Retry Task", 3);
        Long taskId = task.getId();

        // When - First update
        Task task1 = taskRepository.findById(taskId).orElseThrow();
        task1.setStatus(TaskStatus.IN_PROGRESS);
        taskRepository.saveAndFlush(task1);

        // Attempt update with stale version
        Task task2 = createTask("Retry Task", 3); // Simulating stale version
        task2.setId(taskId);
        task2.setVersion(0L); // Stale version

        boolean firstAttemptFailed = false;
        try {
            task2.setStatus(TaskStatus.COMPLETED);
            taskRepository.saveAndFlush(task2);
        } catch (OptimisticLockingFailureException e) {
            firstAttemptFailed = true;
        }

        // Retry with fresh data
        Task freshTask = taskRepository.findById(taskId).orElseThrow();
        freshTask.setStatus(TaskStatus.COMPLETED);
        Task updatedTask = taskRepository.saveAndFlush(freshTask);

        // Then
        assertThat(firstAttemptFailed).isTrue();
        assertThat(updatedTask.getStatus()).isEqualTo(TaskStatus.COMPLETED);
        assertThat(updatedTask.getVersion()).isEqualTo(2L);
    }

    @Test
    @DisplayName("Should maintain version consistency across multiple updates")
    void shouldMaintainVersionConsistency() {
        // Given
        Task task = createAndSaveTask("Version Test Task", 5);
        Long taskId = task.getId();
        assertThat(task.getVersion()).isZero();

        // When - Perform 5 sequential updates
        for (int i = 0; i < 5; i++) {
            Task t = taskRepository.findById(taskId).orElseThrow();
            assertThat(t.getVersion()).isEqualTo((long) i);

            t.setPriority((i % 5) + 1);
            taskRepository.saveAndFlush(t);
        }

        // Then
        Task finalTask = taskRepository.findById(taskId).orElseThrow();
        assertThat(finalTask.getVersion()).isEqualTo(5L);
    }

    private Task createAndSaveTask(String name, int priority) {
        Task task = createTask(name, priority);
        return taskRepository.saveAndFlush(task);
    }

    private Task createTask(String name, int priority) {
        Task task = new Task();
        task.setName(name);
        task.setPriority(priority);
        task.setDueDate(LocalDate.now().plusDays(7));
        task.setAssignee("concurrency-test@example.com");
        task.setStatus(TaskStatus.PENDING);
        task.setProject(testProject);
        return task;
    }
}
