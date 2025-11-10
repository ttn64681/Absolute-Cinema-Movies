package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.model.ShowTime;
import com.acm.cinema_ebkg_system.repository.ShowTimeRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.sql.Time;
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
     * Returns all distinct LocalDate values on which the given movie has entries in the ShowTime table (using MovieShows).
     * Converts java.sql.Timestamp to java.sql.Date, then to java.time.LocalDate for API compatibility.
     */
    public List<LocalDate> getAvailableDatesForMovie(Long movieId) {
        List<Date> sqlDates= showTimeRepository.findAvailableDatesByMovieId(movieId);
        return sqlDates.stream()
            .map(Date::toLocalDate)
            .collect(Collectors.toList());
    }

    /**
     * GET SHOWTIMES FOR A SINGLE SHOWDATE:
     * Returns all times associated with a movie ID and a LocalDate.
     * Converts java.sql.Timestamp java.sql.Time, then to java.time.LocalTime for API compatibility.
     */
    public List<LocalTime> getAvailableTimesForMovieAndDate(Long movieId, LocalDate showDate) {
        List<Time> sqlTimes = new ArrayList<>();
        try {
            System.out.println("Showdate received: " + showDate);
            sqlTimes = showTimeRepository.findTimesByMovieIdAndDate(movieId, showDate);
        } catch (Exception e) {
            System.out.println("Could not retrieve showtimes: " + e.getMessage());
        }
            return sqlTimes.stream()
                .map(Time::toLocalTime)
                .collect(Collectors.toList());
    }

    /**
     * GET COMBINED DATES AND TIMES FOR A MOVIE:
     * Returns all distinct LocalDateTime values on which the given movie has entries in the ShowTime table (using MovieShows).
     * Converts java.sql.Timestamp to java.time.LocalDateTime for API compatibility.
     */
    public List<LocalDateTime> getAvailableTimesForMovie(Long movieId) {
        List<Timestamp> sqlTimes = showTimeRepository.findAvailableTimesByMovieId(movieId);
        return sqlTimes.stream()
            .map(Timestamp::toLocalDateTime)
            .collect(Collectors.toList());
    }

}
