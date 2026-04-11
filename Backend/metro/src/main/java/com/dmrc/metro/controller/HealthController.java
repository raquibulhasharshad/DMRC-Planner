package com.dmrc.metro.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping({"/", "/ping", "/api/ping"})
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Metro Server is running smoothly!");
    }
}
