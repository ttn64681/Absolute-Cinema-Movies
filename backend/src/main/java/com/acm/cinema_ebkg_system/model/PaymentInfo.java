package com.acm.cinema_ebkg_system.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "payment_info")
public class PaymentInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long payment_info_id;

    @NotNull
    @Column(nullable = false)
    private String card_number;

    @NotBlank
    @Column(nullable = false)
    private String billing_address;

    @NotNull
    @Column(nullable = false)
    private LocalDate expiration_date;

    @NotNull
    @Column(nullable = false)
    private String cardholder_name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    // Default constructor
    public PaymentInfo() {}

    // Getters
    public Long getPayment_info_id() {
        return payment_info_id;
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

    public String getCardholder_name() {
        return cardholder_name;
    }

    public User getUser() {
        return user;
    }

    // Setters
    public void setPayment_info_id(Long payment_info_id) {
        this.payment_info_id = payment_info_id;
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

    public void setCardholder_name(String cardholder_name) {
        this.cardholder_name = cardholder_name;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
