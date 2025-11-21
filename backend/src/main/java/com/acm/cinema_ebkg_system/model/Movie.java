package com.acm.cinema_ebkg_system.model;

import com.acm.cinema_ebkg_system.enums.MovieStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;
import java.time.LocalDate;

import com.acm.cinema_ebkg_system.enums.TicketType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/*
 * DB Fields: 
 * id, 
 * title, 
 * status, 
 * genres, 
 * rating, 
 * release_date, 
 * synopsis, 
 * trailer_link, 
 * poster_link, 
 * cast_names, 
 * directors, 
 * producers
 * score
 * duration
 */
@Entity
@Table(name = "movie")
public class Movie {
    @Id // identifies below 'movie_id' as primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // generates unique val for primary key
    private Long movie_id;
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;
    // @NotBlank
    // @Column(nullable = false)
    // private String status; // Must be 'NOW_PLAYING' or 'UPCOMING'
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MovieStatus status;
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String genres;
    @NotBlank
    @Column(nullable = false)
    private String rating; // Must be 'G', 'PG', 'PG-13', 'R', or 'NC-17'
    @NotNull
    @Column(nullable = false)
    private LocalDate release_date;
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String synopsis;
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String trailer_link;
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String poster_link;
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String cast_names; // comma-separated names for simplicity
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String directors; // comma-separated names
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String producers; // comma-separated names
    @Column(nullable = false)
    private int score;
    @Column(nullable = false)
    private int duration;

    // Default constructor
    public Movie() {}

    // Getters
    public Long getMovie_id() {
        return movie_id;
    }

    public String getTitle() {
        return title;
    }

    public String getStatus() {
        return status;
    }

    public String getGenres() {
        return genres;
    }

    public String getRating() {
        return rating;
    }

    public LocalDate getRelease_date() {
        return release_date;
    }

    public String getSynopsis() {
        return synopsis;
    }

    public String getTrailer_link() {
        return trailer_link;
    }

    public String getPoster_link() {
        return poster_link;
    }

    public String getCast_names() {
        return cast_names;
    }

    public String getDirectors() {
        return directors;
    }

    public String getProducers() {
        return producers;
    }

    public int getScore() {
        return score;
    }

    public int getDuration() {
        return duration;
    }

    // Setters
    public void setMovie_id(Long movie_id) {
        this.movie_id = movie_id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setGenres(String genres) {
        this.genres = genres;
    }

    public void setRating(String rating) {
        this.rating = rating;
    }

    public void setRelease_date(LocalDate release_date) {
        this.release_date = release_date;
    }

    public void setSynopsis(String synopsis) {
        this.synopsis = synopsis;
    }

    public void setTrailer_link(String trailer_link) {
        this.trailer_link = trailer_link;
    }

    public void setPoster_link(String poster_link) {
        this.poster_link = poster_link;
    }

    public void setCast_names(String cast_names) {
        this.cast_names = cast_names;
    }

    public void setDirectors(String directors) {
        this.directors = directors;
    }

    public void setProducers(String producers) {
        this.producers = producers;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }
}