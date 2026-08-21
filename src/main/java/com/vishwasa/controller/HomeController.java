package com.vishwasa.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/api/status")
    public ResponseEntity<Map<String, Object>> getApiStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("name", "Vishwasa - Healthcare Access and Medical Fund Management Platform");
        response.put("status", "UP");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "Welcome to Vishwasa API server!");

        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("login", "POST /api/auth/login");
        endpoints.put("register", "POST /api/auth/register");
        endpoints.put("published_campaigns", "GET /api/donations/campaigns/published");
        response.put("endpoints", endpoints);

        return ResponseEntity.ok(response);
    }
}
