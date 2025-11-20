package com.acm.cinema_ebkg_system.dto.booking;

/**
 * Data Transfer Object for Seat information
 */
public class SeatDTO {
    private Long id;
    private String seatRow;
    private String seatNumber;
    private String seatType;
    private Boolean isAvailable;
    private Boolean isTaken; // true if seat is taken (linked to ticket or is_available = false)
    
    // Default constructor
    public SeatDTO() {}
    
    // Constructor
    public SeatDTO(Long id, String seatRow, String seatNumber, String seatType, Boolean isAvailable, Boolean isTaken) {
        this.id = id;
        this.seatRow = seatRow;
        this.seatNumber = seatNumber;
        this.seatType = seatType;
        this.isAvailable = isAvailable;
        this.isTaken = isTaken;
    }
    
    // Getters
    public Long getId() {
        return id;
    }
    
    public String getSeatRow() {
        return seatRow;
    }
    
    public String getSeatNumber() {
        return seatNumber;
    }
    
    public String getSeatType() {
        return seatType;
    }
    
    public Boolean getIsAvailable() {
        return isAvailable;
    }
    
    public Boolean getIsTaken() {
        return isTaken;
    }
    
    // Setters
    public void setId(Long id) {
        this.id = id;
    }
    
    public void setSeatRow(String seatRow) {
        this.seatRow = seatRow;
    }
    
    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }
    
    public void setSeatType(String seatType) {
        this.seatType = seatType;
    }
    
    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
    
    public void setIsTaken(Boolean isTaken) {
        this.isTaken = isTaken;
    }
}

