package com.ifm.projectmgmt.service;

import com.ifm.projectmgmt.entity.Task;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Service for sending asynchronous email notifications.
 * Uses thread pool configured in AsyncConfig for non-blocking operations.
 * Uses Java text blocks for cleaner multi-line log formatting.
 * Note: This is a mock implementation that logs notifications instead of sending actual emails.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Slf4j
@Service
public class NotificationService {

    /**
     * Send email notification when a new task is created.
     * Executes asynchronously in a separate thread from the task executor pool.
     *
     * @param task the newly created task
     * @return CompletableFuture that completes when notification is sent
     */
    @Async("taskExecutor")
    public CompletableFuture<Void> sendTaskCreatedNotification(Task task) {
        String threadName = Thread.currentThread().getName();

        log.info("""
                         ========================================
                         EMAIL NOTIFICATION - TASK CREATED
                         ========================================
                         Thread: {}
                         To: {}
                         Subject: New Task Assigned - {}
                         ----------------------------------------
                         You have been assigned a new task:
                         
                           Task Name    : {}
                           Priority     : {} (1=Low, 5=High)
                           Due Date     : {}
                           Status       : {}
                           Project      : {}
                         
                         Please log in to the system to view more details.
                         ========================================
                         """,
                 threadName,
                 task.getAssignee(),
                 task.getName(),
                 task.getName(),
                 task.getPriority(),
                 task.getDueDate(),
                 task.getStatus(),
                 task.getProject().getName()
        );

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Send email notification when a task is updated.
     * Executes asynchronously in a separate thread from the task executor pool.
     *
     * @param task    the updated task
     * @param changes description of what changed
     * @return CompletableFuture that completes when notification is sent
     */
    @Async("taskExecutor")
    public CompletableFuture<Void> sendTaskUpdatedNotification(Task task, String changes) {
        String threadName = Thread.currentThread().getName();

        log.info("""
                         ========================================
                         EMAIL NOTIFICATION - TASK UPDATED
                         ========================================
                         Thread: {}
                         To: {}
                         Subject: Task Updated - {}
                         ----------------------------------------
                         Your task has been updated:
                         
                           Task Name    : {}
                           Changes      : {}
                           Current Status: {}
                           Priority     : {}
                           Due Date     : {}
                           Project      : {}
                         
                         Please log in to the system to view more details.
                         ========================================
                         """,
                 threadName,
                 task.getAssignee(),
                 task.getName(),
                 task.getName(),
                 changes,
                 task.getStatus(),
                 task.getPriority(),
                 task.getDueDate(),
                 task.getProject().getName()
        );

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Send email notification when a task status is changed.
     * Executes asynchronously in a separate thread from the task executor pool.
     *
     * @param task      the task with updated status
     * @param oldStatus the previous status
     * @param newStatus the new status
     * @return CompletableFuture that completes when notification is sent
     */
    @Async("taskExecutor")
    public CompletableFuture<Void> sendTaskStatusChangedNotification(Task task, String oldStatus, String newStatus) {
        String threadName = Thread.currentThread().getName();

        log.info("""
                         ========================================
                         EMAIL NOTIFICATION - STATUS CHANGED
                         ========================================
                         Thread: {}
                         To: {}
                         Subject: Task Status Changed - {}
                         ----------------------------------------
                         The status of your task has been changed:
                         
                           Task Name    : {}
                           Old Status   : {}
                           New Status   : {}
                           Priority     : {}
                           Due Date     : {}
                           Project      : {}
                         
                         Please log in to the system to view more details.
                         ========================================
                         """,
                 threadName,
                 task.getAssignee(),
                 task.getName(),
                 task.getName(),
                 oldStatus,
                 newStatus,
                 task.getPriority(),
                 task.getDueDate(),
                 task.getProject().getName()
        );

        return CompletableFuture.completedFuture(null);
    }
}
