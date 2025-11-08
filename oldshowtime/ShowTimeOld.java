package com.acm.cinema_ebkg_system.model;

// JPA annotations to map this class to the show_times table
import jakarta.persistence.Column;           // maps a field to a specific column
import jakarta.persistence.Entity;           // marks this class as a DB entity
import jakarta.persistence.GeneratedValue;   // auto-generate PK values
import jakarta.persistence.GenerationType;   // strategy for PK generation
import jakarta.persistence.Id;               // marks primary key field
import jakarta.persistence.Table;            // maps to a specific table name

// Java time types used by columns
import java.time.LocalDateTime;             
import java.time.LocalTime;                

@Entity
@Table(name = "show_time")
public class ShowTimeOld {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long show_time_id;

    @Column(name = "show_date_id", nullable = false)
    private Long show_date_id;

    @Column(name = "start_time", nullable = false)
    private LocalTime start_time;

    @Column(name = "end_time", nullable = false)
    private LocalTime end_time;

    @Column(name = "created_at")
    private LocalDateTime created_at;

    // Default constructor
    public ShowTimeOld() {}

    // Getters
    public Long getShow_time_id() { return show_time_id; }
    public Long getShow_date_id() { return show_date_id; }
    public LocalTime getStart_time() { return start_time; }
    public LocalTime getEnd_time() { return end_time; }
    public LocalDateTime getCreated_at() { return created_at; }

    // Setters
    public void setShow_time_id(Long show_time_id) { this.show_time_id = show_time_id; }
    public void setShow_date_id(Long show_date_id) { this.show_date_id = show_date_id; }
    public void setStart_time(LocalTime start_time) { this.start_time = start_time; }
    public void setEnd_time(LocalTime end_time) { this.end_time = end_time; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }
}


