package com.ifm.projectmgmt.util;

/**
 * Application-wide constants.
 */
public final class Constants {

    private Constants() {
    }

    // API Base Paths
    public static final String API_BASE_PATH = "/api";
    public static final String PROJECTS_PATH = API_BASE_PATH + "/projects";
    public static final String TASKS_PATH = API_BASE_PATH + "/tasks";

    // Date Format
    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

    // Pagination Defaults
    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    // Sorting
    public static final String SORT_BY_PRIORITY = "priority";
    public static final String SORT_BY_DUE_DATE = "dueDate";
    public static final String SORT_ORDER_ASC = "asc";
    public static final String SORT_ORDER_DESC = "desc";

    // Error Messages
    public static final String ERROR_PROJECT_NOT_FOUND = "Project not found with id: ";
    public static final String ERROR_TASK_NOT_FOUND = "Task not found with id: ";
    public static final String ERROR_INVALID_DATE_RANGE = "Start date must be before end date";
    public static final String ERROR_CONCURRENT_MODIFICATION = "Task was modified by another process. Please retry.";

    // Cache Names
    public static final String CACHE_TASK_BY_ID = "taskById";
    public static final String CACHE_TASK_SEARCH = "taskSearch";
}
