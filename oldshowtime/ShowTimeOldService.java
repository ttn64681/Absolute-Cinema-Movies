package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.model.ShowTime;
import com.acm.cinema_ebkg_system.model.ShowTimeOld;
import com.acm.cinema_ebkg_system.repository.ShowTimeRepository;
import com.acm.cinema_ebkg_system.repository.ShowTimeRepositoryOld;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import java.sql.Date;

@Service // Spring service bean for business logic layer
public class ShowTimeServiceOld {

//     // Dependency injection of repositories for database operations
//     private final ShowTimeRepository showDateRepository;
//     private final ShowTimeRepositoryOld showTimeRepository;

//     // Constructor injection - Spring automatically provides repository instances
//     public ShowTimeServiceOld(ShowTimeRepository showDateRepository, ShowTimeRepositoryOld showTimeRepository) {
//         this.showDateRepository = showDateRepository;
//         this.showTimeRepository = showTimeRepository;
//     }

//     /**
//      * Returns all distinct LocalDate values on which the given movie has entries in show_dates.
//      * Converts java.sql.Date to java.time.LocalDate for API compatibility.
//      *
//      * @param movieId movie primary key
//      * @return ordered list of available calendar dates (ascending)
//      */
//    /* public List<LocalDate> getAvailableDatesForMovie(Long movieId) {
//         List<Date> sqlDates = showDateRepository.findAvailableDatesByMovieId(movieId);
//         return sqlDates.stream()
//             .map(Date::toLocalDate)
//             .collect(Collectors.toList());
//     } */

//     /**
//      * Returns all showtime rows for a given movie and date combo.
//      *
//      * @param movieId movie primary key
//      * @param date target date (LocalDate)
//      * @return list of ShowTime ordered by start_time ascending
//      */
//     /*public List<ShowTimeOld> getAvailableTimesForMovieAndDate(Long movieId, LocalDate date) {
//         return showTimeRepository.findByMovieIdAndDate(movieId, date);
//     }*/

//     /**
//      * Returns a full schedule map for a movie: each date mapped to its list of showtimes.
//      *
//      * @param movieId movie primary key
//      * @return Map where key = LocalDate, value = List<ShowTime>
//      */
//     /*public Map<LocalDate, List<ShowTime>> getMovieShowSchedule(Long movieId) {
//         List<LocalDate> dates = getAvailableDatesForMovie(movieId);
//         return dates.stream()
//             .collect(Collectors.toMap(
//                 d -> d,
//                 d -> getAvailableTimesForMovieAndDate(movieId, d)
//             ));
//     }*/

//     /**
//      * Returns showtimes for a movie on a specific date within a time window.
//      *
//      * @param movieId movie primary key
//      * @param date LocalDate to filter
//      * @param startTime inclusive start of time window
//      * @param endTime inclusive end of time window
//      * @return list of ShowTime ordered by start_time; empty if no matching date exists
//      */
//     /*public List<ShowTimeOld> getShowTimesInRange(Long movieId, LocalDate date, LocalTime startTime, LocalTime endTime) {
//         Optional<ShowTime> sd = showDateRepository.findByMovieIdAndDate(movieId, date);
//         if (sd.isEmpty()) {
//             return List.of();
//         }
//         return showTimeRepository
//             .findByShowDateIdAndTimeRange(sd.get().getShow_date_id(), startTime, endTime);
//     } */
}


