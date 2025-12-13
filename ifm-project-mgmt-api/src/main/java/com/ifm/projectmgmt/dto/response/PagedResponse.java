package com.ifm.projectmgmt.dto.response;

import lombok.*;

import java.util.List;

/**
 * Generic DTO for paginated responses.
 *
 * @param <T> the type of content in the page
 * @author Kervin Balibagoso
 * @version 1.0.0
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {

    private List<T> content;

    private long totalElements;

    private int totalPages;

    private int currentPage;

    private int pageSize;

    private boolean first;

    private boolean last;

    private boolean empty;

    /**
     * Create a paged response from Spring Data Page object.
     *
     * @param page the Spring Data Page
     * @param <T>  the content type
     * @return paged response
     */
    public static <T> PagedResponse<T> of(org.springframework.data.domain.Page<T> page) {
        return PagedResponse.<T>builder()
                            .content(page.getContent())
                            .totalElements(page.getTotalElements())
                            .totalPages(page.getTotalPages())
                            .currentPage(page.getNumber())
                            .pageSize(page.getSize())
                            .first(page.isFirst())
                            .last(page.isLast())
                            .empty(page.isEmpty())
                            .build();
    }
}
