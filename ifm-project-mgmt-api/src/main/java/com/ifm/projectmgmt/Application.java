package com.ifm.projectmgmt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main Spring Boot Application Class for IFM Project Management Tool.
 *
 * This application provides a REST API for managing projects and tasks,
 * with features including:
 * - Task creation and management
 * - Priority-based sorting
 * - Date-based filtering
 * - Asynchronous email notifications
 * - Thread-safe status updates
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@EnableAsync
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
