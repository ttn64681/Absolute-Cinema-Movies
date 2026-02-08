package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.model.MovieShow;
import com.acm.cinema_ebkg_system.model.ShowTime;
import com.acm.cinema_ebkg_system.repository.ShowTimeRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;

@Service
@Slf4j
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
    public List<String> getAvailableTimesForMovieAndDate(Long movieId, LocalDate showDate) {
        List<Time> sqlTimes = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("h:mm a");
        try {
            log.debug("Showdate received: {}", showDate);
            sqlTimes = showTimeRepository.findTimesByMovieIdAndDate(movieId, showDate);
        } catch (Exception e) {
            log.debug("Could not retrieve showtimes: {}", e.getMessage());
        }
        
        return sqlTimes.stream()
            .map(Time::toLocalTime)
            .map(time -> time.format(formatter))
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

    public List<String> convertToAMPM(List<LocalTime> timeList) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
        List<String> formattedTimes = new ArrayList<>();

        for (LocalTime time : timeList) {
            String formattedTime = time.format(formatter);
            log.debug("Showtime in AM/PM: {}", time);
            formattedTimes.add(formattedTime);
        }
        return formattedTimes;
    }


    public ShowTime createShowTime(ShowTime showTime) {
        return showTimeRepository.save(showTime);
    }

    /**
     * Get movie_show.id from movieId, date, and time
     * Used by booking flow to identify which show to book
     * 
     * Based on current DB schema:
     * - movie_show.show_time_id → show_time.id (foreign key)
     * - show_time.show_time → timestamp column
     * 
     * @param movieId The movie ID
     * @param date The show date (LocalDate)
     * @param startTime The show start time (LocalTime)
     * @return The movie_show.id (Long) or null if not found
     */
    public Long getMovieShowIdByMovieDateAndTime(Long movieId, LocalDate date, LocalTime startTime) {
        try {
            // Combine date and time into LocalDateTime
            LocalDateTime showDateTime = LocalDateTime.of(date, startTime);
            Timestamp timestamp = Timestamp.valueOf(showDateTime);
            
            // Query to find movie_show.id using the current schema
            // movie_show.show_time_id → show_time.id
            Long movieShowId = showTimeRepository.findMovieShowIdByMovieIdAndDateTime(movieId, timestamp);
            
            return movieShowId;
        } catch (Exception e) {
            log.error("Error getting movie show ID", e);
            return null;
        }
    }

    /*public ShowTime addShowTime(Long movieShowId) {

    }*/

}
