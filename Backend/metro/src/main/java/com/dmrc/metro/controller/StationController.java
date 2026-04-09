package com.dmrc.metro.controller;

import com.dmrc.metro.service.MetroDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    private final MetroDataService dataService;

    public StationController(MetroDataService dataService) {
        this.dataService = dataService;
    }

    @GetMapping
    public List<StationResponse> getAllStations() {
        return dataService.getAllStations().stream()
                .map(s -> new StationResponse(s.getId(), s.getDisplayName(), String.join(", ", s.getLines())))
                .collect(Collectors.toList());
    }

    public static class StationResponse {
        public String id;
        public String name;
        public String lines;

        public StationResponse(String id, String name, String lines) {
            this.id = id;
            this.name = name;
            this.lines = lines;
        }
    }
}
