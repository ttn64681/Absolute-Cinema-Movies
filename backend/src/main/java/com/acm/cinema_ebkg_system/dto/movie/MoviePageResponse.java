package com.acm.cinema_ebkg_system.dto.movie;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

/**
 * Paginated movie response DTO
 * 
 * Does the following:
 * - Returns page data w/ metadata (current page, total pages, total items)
 * - Frontend can determine if more pages exist (hasNextPage)
 * - Supports both append & replace strategies
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MoviePageResponse {
    private List<MovieSummary> movies;
    private int currentPage;
    private int pageSize;
    private long totalItems;
    private int totalPages;
    private boolean hasNextPage;
    private boolean hasPreviousPage;
    
    public MoviePageResponse(List<MovieSummary> movies, int currentPage, int pageSize, long totalItems) {
        this.movies = movies;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalItems = totalItems;
        this.totalPages = (int) Math.ceil((double) totalItems / pageSize);
        this.hasNextPage = currentPage < totalPages - 1;
        this.hasPreviousPage = currentPage > 0;
    }
}





