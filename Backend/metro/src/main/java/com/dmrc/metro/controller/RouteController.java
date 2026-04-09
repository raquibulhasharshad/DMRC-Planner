package com.dmrc.metro.controller;

import com.dmrc.metro.entity.RouteResult;
import com.dmrc.metro.service.RoutingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/route")
public class RouteController {

    private final RoutingService routingService;

    public RouteController(RoutingService routingService) {
        this.routingService = routingService;
    }

    @GetMapping
    public ResponseEntity<RouteResult> getRoute(
            @RequestParam String startId,
            @RequestParam String endId,
            @RequestParam(defaultValue = "false") boolean isSunday) {
        
        RouteResult result = routingService.findShortestRoute(startId, endId, isSunday);
        if (result == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(result);
    }
}
