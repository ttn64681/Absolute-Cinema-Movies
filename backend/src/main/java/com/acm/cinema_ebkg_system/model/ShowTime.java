package com.acm.cinema_ebkg_system.model;

// JPA annotations to map this class to the show_dates table
import jakarta.persistence.Column;           // maps a field to a specific column          
import jakarta.persistence.Entity;           // marks this class as a DB entity
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;   // auto-generate PK values
import jakarta.persistence.GenerationType;   // strategy for PK generation
import jakarta.persistence.Id;               // marks primary key field
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;            // maps to a specific table name

// Java time types used by columns
import java.time.LocalDate; // (YYYY-MM-DD)
import java.time.LocalDateTime; // date + time (timestamp)

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Entity
@Data
@Table(name = "show_time")
public class ShowTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Each ShowTime is associated with one MovieShow
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_show_id", nullable = false)
    private MovieShow movieShow;

    @Column(name = "show_time", nullable = false)
    private LocalDateTime showTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Default constructor
    public ShowTime() {}
}


