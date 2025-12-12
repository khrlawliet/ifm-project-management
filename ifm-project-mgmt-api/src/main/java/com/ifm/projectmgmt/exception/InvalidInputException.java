package com.ifm.projectmgmt.exception;

/**
 * Exception thrown when input validation fails.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
public class InvalidInputException extends RuntimeException {

    public InvalidInputException(String message) {
        super(message);
    }

    public InvalidInputException(String message, Throwable cause) {
        super(message, cause);
    }
}
