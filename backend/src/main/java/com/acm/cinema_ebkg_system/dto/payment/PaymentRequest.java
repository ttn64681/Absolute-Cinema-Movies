package com.acm.cinema_ebkg_system.dto.payment;

import java.time.LocalDate;

public class PaymentRequest {
    
    private String cardholder_name;
    private String card_number;
    private String billing_address;
    private LocalDate expiration_date;

    // Default constructor
    public PaymentRequest() {}

    // Constructor
    public PaymentRequest(String cardholder_name, String card_number, String billing_address, LocalDate expiration_date) {
        this.cardholder_name = cardholder_name;
        this.card_number = card_number;
        this.billing_address = billing_address;
        this.expiration_date = expiration_date;
    }

    // Getters
    public String getCardholder_name() {
        return cardholder_name;
    }

    public String getCard_number() {
        return card_number;
    }

    public String getBilling_address() {
        return billing_address;
    }

    public LocalDate getExpiration_date() {
        return expiration_date;
    }

    // Setters
    public void setCardholder_name(String cardholder_name) {
        this.cardholder_name = cardholder_name;
    }

    public void setCard_number(String card_number) {
        this.card_number = card_number;
    }

    public void setBilling_address(String billing_address) {
        this.billing_address = billing_address;
    }

    public void setExpiration_date(LocalDate expiration_date) {
        this.expiration_date = expiration_date;
    }
}
