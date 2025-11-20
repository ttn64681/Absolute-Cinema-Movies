package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.model.ShowDate;
import com.acm.cinema_ebkg_system.model.ShowTime;
import com.acm.cinema_ebkg_system.repository.ShowDateRepository;
import com.acm.cinema_ebkg_system.repository.ShowTimeRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import java.sql.Date;

@Service // Spring service bean for business logic layer
public class ShowTimeService {

    // Dependency injection of repositories for database operations
    private final ShowDateRepository showDateRepository;
    private final ShowTimeRepository showTimeRepository;

    // Constructor injection - Spring automatically provides repository instances
    public ShowTimeService(ShowDateRepository showDateRepository, ShowTimeRepository showTimeRepository) {
        this.showDateRepository = showDateRepository;
        this.showTimeRepository = showTimeRepository;
    }

    /**
     * Returns all distinct LocalDate values on which the given movie has entries in show_dates.
     * Converts java.sql.Date to java.time.LocalDate for API compatibility.
     *
     * @param movieId movie primary key
     * @return ordered list of available calendar dates (ascending)
     */
    public List<LocalDate> getAvailableDatesForMovie(Long movieId) {
        List<Date> sqlDates = showDateRepository.findAvailableDatesByMovieId(movieId);
        return sqlDates.stream()
            .map(Date::toLocalDate)
            .collect(Collectors.toList());
    }

    /**
     * Returns all showtime rows for a given movie and date combo.
     *
     * @param movieId movie primary key
     * @param date target date (LocalDate)
     * @return list of ShowTime ordered by start_time ascending
     */
    public List<ShowTime> getAvailableTimesForMovieAndDate(Long movieId, LocalDate date) {
        return showTimeRepository.findByMovieIdAndDate(movieId, date);
    }

    /**
     * Returns a full schedule map for a movie: each date mapped to its list of showtimes.
     *
     * @param movieId movie primary key
     * @return Map where key = LocalDate, value = List<ShowTime>
     */
    public Map<LocalDate, List<ShowTime>> getMovieShowSchedule(Long movieId) {
        List<LocalDate> dates = getAvailableDatesForMovie(movieId);
        return dates.stream()
            .collect(Collectors.toMap(
                d -> d,
                d -> getAvailableTimesForMovieAndDate(movieId, d)
            ));
    }

    /**
     * Returns showtimes for a movie on a specific date within a time window.
     *
     * @param movieId movie primary key
     * @param date LocalDate to filter
     * @param startTime inclusive start of time window
     * @param endTime inclusive end of time window
     * @return list of ShowTime ordered by start_time; empty if no matching date exists
     */
    public List<ShowTime> getShowTimesInRange(Long movieId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        Optional<ShowDate> sd = showDateRepository.findByMovieIdAndDate(movieId, date);
        if (sd.isEmpty()) {
            return List.of();
        }
        return showTimeRepository
            .findByShowDateIdAndTimeRange(sd.get().getShow_date_id(), startTime, endTime);
    }
    
    /**
     * Get movie_show.id from movie_id, date, and start_time
     * 
     * Database flow:
     * 1. Find show_date where movie_show.movie_id = movieId AND show_date = date
     * 2. Find show_time where show_date_id = show_date.show_date_id AND start_time = time
     * 3. Return show_date.movie_show_id (which is movie_show.id)
     * 
     * @param movieId The movie.movie_id
     * @param date The show date
     * @param startTime The show start_time
     * @return movie_show.id or null if not found
     */
    public Long getMovieShowIdByMovieDateAndTime(Long movieId, LocalDate date, LocalTime startTime) {
        // Find the show_date for this movie and date
        Optional<ShowDate> showDate = showDateRepository.findByMovieIdAndDate(movieId, date);
        if (showDate.isEmpty()) {
            return null;
        }
        
        // Find the show_time for this show_date and start_time
        List<ShowTime> showTimes = showTimeRepository.findByShowDateIdOrderByStartTime(showDate.get().getShow_date_id());
        for (ShowTime st : showTimes) {
            if (st.getStart_time().equals(startTime)) {
                // Found matching show_time, return the movie_show_id from show_date
                return showDate.get().getMovie_show_id();
            }
        }
        
        return null; // No matching show_time found
    }
}


