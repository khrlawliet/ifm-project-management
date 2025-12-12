package com.ifm.projectmgmt.repository;

import com.ifm.projectmgmt.entity.Project;
import com.ifm.projectmgmt.entity.Task;
import com.ifm.projectmgmt.entity.TaskStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;

import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for TaskRepository.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@DataJpaTest
@TestPropertySource(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@DisplayName("TaskRepository Integration Tests")
class TaskRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    private Project testProject;

    @BeforeEach
    void setUp() {
        testProject = new Project();
        testProject.setName("Test Project");
        testProject.setDescription("Test Description");
        testProject = entityManager.persistAndFlush(testProject);
    }

    @Test
    @DisplayName("Should find tasks by project ID")
    void shouldFindTasksByProjectId() {
        // Given
        Task task1 = createTask("Task 1", 2, testProject);
        Task task2 = createTask("Task 2", 3, testProject);
        entityManager.persistAndFlush(task1);
        entityManager.persistAndFlush(task2);

        PageRequest pageRequest = PageRequest.of(0, 10);

        // When
        Page<Task> result = taskRepository.findByProjectId(testProject.getId(), pageRequest);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should find tasks by project ID and date range")
    void shouldFindTasksByProjectIdAndDateRange() {
        // Given
        Task task1 = createTask("Task 1", 2, testProject);
        task1.setDueDate(LocalDate.now().plusDays(5));

        Task task2 = createTask("Task 2", 3, testProject);
        task2.setDueDate(LocalDate.now().plusDays(15));

        entityManager.persistAndFlush(task1);
        entityManager.persistAndFlush(task2);

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(10);
        PageRequest pageRequest = PageRequest.of(0, 10);

        // When
        Page<Task> result = taskRepository.findByProjectIdAndDueDateBetween(
                testProject.getId(), startDate, endDate, pageRequest);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Task 1");
    }

    @Test
    @DisplayName("Should find tasks with optional date range - both null")
    void shouldFindTasksWithOptionalDateRangeBothNull() {
        // Given
        Task task = createTask("Task 1", 2, testProject);
        entityManager.persistAndFlush(task);

        PageRequest pageRequest = PageRequest.of(0, 10);

        // When
        Page<Task> result = taskRepository.findByProjectIdWithOptionalDateRange(
                testProject.getId(), null, null, pageRequest);

        // Then
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should find tasks by status")
    void shouldFindTasksByStatus() {
        // Given
        Task task1 = createTask("Task 1", 2, testProject);
        task1.setStatus(TaskStatus.IN_PROGRESS);

        Task task2 = createTask("Task 2", 3, testProject);
        task2.setStatus(TaskStatus.PENDING);

        entityManager.persistAndFlush(task1);
        entityManager.persistAndFlush(task2);

        PageRequest pageRequest = PageRequest.of(0, 10);

        // When
        Page<Task> result = taskRepository.findByStatus(TaskStatus.IN_PROGRESS, pageRequest);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
    }

    @Test
    @DisplayName("Should find tasks by assignee")
    void shouldFindTasksByAssignee() {
        // Given
        Task task1 = createTask("Task 1", 2, testProject);
        task1.setAssignee("john@example.com");

        Task task2 = createTask("Task 2", 3, testProject);
        task2.setAssignee("jane@example.com");

        entityManager.persistAndFlush(task1);
        entityManager.persistAndFlush(task2);

        PageRequest pageRequest = PageRequest.of(0, 10);

        // When
        Page<Task> result = taskRepository.findByAssignee("john@example.com", pageRequest);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getAssignee()).isEqualTo("john@example.com");
    }

    @Test
    @DisplayName("Should count tasks by project ID")
    void shouldCountTasksByProjectId() {
        // Given
        Task task1 = createTask("Task 1", 2, testProject);
        Task task2 = createTask("Task 2", 3, testProject);
        entityManager.persistAndFlush(task1);
        entityManager.persistAndFlush(task2);

        // When
        long count = taskRepository.countByProjectId(testProject.getId());

        // Then
        assertThat(count).isEqualTo(2);
    }

    @Test
    @DisplayName("Should find overdue tasks")
    void shouldFindOverdueTasks() {
        // Given
        Task overdueTask = createTask("Overdue Task", 1, testProject);
        overdueTask.setDueDate(LocalDate.now().minusDays(5));
        overdueTask.setStatus(TaskStatus.PENDING);

        Task futureTask = createTask("Future Task", 2, testProject);
        futureTask.setDueDate(LocalDate.now().plusDays(5));

        entityManager.persistAndFlush(overdueTask);
        entityManager.persistAndFlush(futureTask);

        // When
        List<Task> overdueTasks = taskRepository.findByDueDateBeforeAndStatusNot(
                LocalDate.now(), TaskStatus.COMPLETED);

        // Then
        assertThat(overdueTasks).hasSize(1);
        assertThat(overdueTasks.get(0).getName()).isEqualTo("Overdue Task");
    }

    @Test
    @DisplayName("Should sort tasks by priority")
    void shouldSortTasksByPriority() {
        // Given
        Task task1 = createTask("Task 1", 5, testProject);
        Task task2 = createTask("Task 2", 1, testProject);
        Task task3 = createTask("Task 3", 3, testProject);

        entityManager.persistAndFlush(task1);
        entityManager.persistAndFlush(task2);
        entityManager.persistAndFlush(task3);

        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by("priority").ascending());

        // When
        Page<Task> result = taskRepository.findByProjectId(testProject.getId(), pageRequest);

        // Then
        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent().get(0).getPriority()).isEqualTo(1);
        assertThat(result.getContent().get(1).getPriority()).isEqualTo(3);
        assertThat(result.getContent().get(2).getPriority()).isEqualTo(5);
    }

    private Task createTask(String name, int priority, Project project) {
        Task task = new Task();
        task.setName(name);
        task.setPriority(priority);
        task.setDueDate(LocalDate.now().plusDays(7));
        task.setAssignee("test@example.com");
        task.setStatus(TaskStatus.PENDING);
        task.setProject(project);
        return task;
    }
}
