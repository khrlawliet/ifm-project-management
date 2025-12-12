package com.ifm.projectmgmt.exception;

/**
 * Exception thrown when a requested resource (Project, Task, etc.) is not found.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
