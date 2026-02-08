package com.acm.cinema_ebkg_system.dto.movie;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * Paginated response wrapper for movie lists.
 * Contains movies for current page & pagination metadata.
 */
@Getter
@Setter
@NoArgsConstructor
@Slf4j
public class PaginatedMovieResponse {
    private List<MovieSummary> movies;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private boolean hasNext;
    private boolean hasPrevious;
    private int pageSize;

    public PaginatedMovieResponse(List<MovieSummary> movies, int currentPage, int totalPages, 
                                 long totalElements, boolean hasNext, boolean hasPrevious, int pageSize) {
        this.movies = movies;
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.totalElements = totalElements;
        this.hasNext = hasNext;
        this.hasPrevious = hasPrevious;
        this.pageSize = pageSize;
        if (log.isDebugEnabled()) {
            log.debug("PaginatedMovieResponse: currentPage={}, totalPages={}, totalElements={}, hasNext={}, hasPrevious={}",
                    currentPage, totalPages, totalElements, hasNext, hasPrevious);
        }
    }
}


