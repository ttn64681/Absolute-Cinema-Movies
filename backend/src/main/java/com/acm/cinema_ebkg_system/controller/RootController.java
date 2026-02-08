package com.acm.cinema_ebkg_system.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Root endpoint so visiting the backend URL does not show a 404.
 * The app is a REST API; use the frontend URL for the UI.
 */
@RestController
public class RootController {

    @GetMapping(value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, String> root() {
        return Map.of(
                "name", "ACM Cinema E-Booking API",
                "message", "Use the frontend app URL for the UI. Health: /actuator/health"
        );
    }
}
