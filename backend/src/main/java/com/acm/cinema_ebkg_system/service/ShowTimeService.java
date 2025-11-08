package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.model.ShowTime;
import com.acm.cinema_ebkg_system.repository.ShowTimeRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.sql.Timestamp;

@Service
public class ShowTimeService {

    // Dependency injection of repositories for database operations
    private final ShowTimeRepository showTimeRepository;

    // Constructor injection - Spring automatically provides repository instances
    public ShowTimeService(ShowTimeRepository showTimeRepository) {
        this.showTimeRepository = showTimeRepository;
    }

    /**
     * GET SHOWDATES FOR A MOVIE:
     * Returns all distinct LocalDateTime values on which the given movie has entries in show_dates.
     * Converts java.sql.Timestamp to java.time.LocalDateTime for API compatibility.
     */
    public List<LocalDateTime> getAvailableTimesForMovie(Long movieId) {
        List<Timestamp> sqlTimes = showTimeRepository.findAvailableTimesByMovieId(movieId);
        return sqlTimes.stream()
            .map(Timestamp::toLocalDateTime)
            .collect(Collectors.toList());
    }

}
