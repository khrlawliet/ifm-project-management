package com.ifm.projectmgmt.exception;

/**
 * Exception thrown when optimistic locking fails due to concurrent modification.
 *
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
public class ConcurrentModificationException extends RuntimeException {

    public ConcurrentModificationException(String message) {
        super(message);
    }

    public ConcurrentModificationException(String message, Throwable cause) {
        super(message, cause);
    }
}
