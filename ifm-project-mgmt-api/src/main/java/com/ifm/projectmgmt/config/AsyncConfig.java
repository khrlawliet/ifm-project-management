package com.ifm.projectmgmt.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Configuration class for asynchronous task execution.
 * Configures a thread pool for handling notification emails asynchronously.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Slf4j
@EnableAsync
@Configuration
public class AsyncConfig implements AsyncConfigurer {

    /**
     * Configure the thread pool executor for async tasks.
     * Uses ThreadPoolExecutor.CallerRunsPolicy to handle rejections gracefully.
     *
     * @return configured executor
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("notification-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);

        // Initialize the executor
        executor.initialize();

        log.info("Async Task Executor initialized with core pool size: {}, max pool size: {}",
                 executor.getCorePoolSize(), executor.getMaxPoolSize());

        return executor;
    }

    /**
     * Handle exceptions thrown by async methods.
     *
     * @return exception handler
     */
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (throwable, method, params) -> {
            log.error("Async exception in method: {} with parameters: {}",
                     method.getName(), params, throwable);
            log.error("Exception message: {}", throwable.getMessage());
        };
    }
}
