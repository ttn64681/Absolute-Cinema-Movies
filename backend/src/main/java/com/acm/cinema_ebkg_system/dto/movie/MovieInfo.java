package com.acm.cinema_ebkg_system.dto.movie;

import java.time.LocalDate;

/**
 * Complete set of Movie attributes.
 * Used when the Admin adds a new Movie.
 */
public class MovieInfo {
    private Long movie_id;
    private String title;
    private String status;
    private String genres;
    private String rating;
    private LocalDate release_date;
    private String synopsis; 
    private String trailer_link;
    private String poster_link;
    private String cast_names;
    private String directors;
    private String producers;
    private int score;
    private int duration;

    // Default constructor
    public MovieInfo() {}

    // Constructor
    public MovieInfo(Long movie_id, String title, String status, String genres, String rating, LocalDate release_date, String synopsis, String trailer_link, String poster_link, String cast_names, String directors, String producers, int score, int duration) {
        this.movie_id = movie_id;
        this.title = title;
        this.status = status;
        this.genres = genres;
        this.rating = rating;
        this.release_date = release_date;
        this.synopsis = synopsis;
        this.trailer_link = trailer_link;
        this.poster_link = poster_link;
        this.cast_names = cast_names;
        this.directors = directors;
        this.producers = producers;
        this.score = score;
        this.duration = duration;
    }

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
