package com.dmrc.metro.service;

import org.springframework.stereotype.Service;
import com.dmrc.metro.entity.StationNode;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class FareCalculator {

    // Airport line fare matrix mapping (Station1 -> Station2 -> Fare)
    private static final Map<String, Map<String, Double>> airportFareMatrix = new HashMap<>();

    static {
        // Simple helper to load matrix for Airport Express (Orange Line)
        String[] stations = {
            "New Delhi-Airport Express", "Shivaji Stadium", "Dhaula Kuan",
            "Delhi Aerocity", "IGI Airport", "Dwarka Sector 21", "Yashobhoomi Dwarka Sector - 25"
        };
        
        // Fares provided by user image (symmetric)
        // Row 0: New Delhi
        double[][] fares = {
            { 0, 21, 43, 54, 64, 64, 75 }, // New Delhi
            { 21, 0, 21, 32, 54, 64, 75 }, // Shivaji Stadium
            { 43, 21, 0, 21, 32, 54, 64 }, // Dhaula Kuan
            { 54, 32, 21, 0, 21, 32, 43 }, // Delhi Aerocity
            { 64, 54, 32, 21, 0, 21, 32 }, // IGI Airport
            { 64, 64, 54, 32, 21, 0, 21 }, // Dwarka Sec 21
            { 75, 75, 64, 43, 32, 21, 0 }  // Yashobhoomi Dwarka (not in CSV but let's add it for completeness)
        };

        for (int i = 0; i < stations.length; i++) {
            Map<String, Double> map = new HashMap<>();
            for (int j = 0; j < stations.length; j++) {
                map.put(stations[j], fares[i][j]);
            }
            airportFareMatrix.put(stations[i], map);
        }
    }

    public double calculateFare(List<StationNode> path, double distanceInKm, boolean isSunday) {
        if (path == null || path.size() < 2) return 0;
        
        StationNode start = path.get(0);
        StationNode end = path.get(path.size() - 1);

        // Check if pure Airport Express journey
        if (start.getLines().contains("Orange line") && end.getLines().contains("Orange line") 
            && path.stream().allMatch(n -> n.getLines().contains("Orange line"))) {
            if (airportFareMatrix.containsKey(start.getId()) && airportFareMatrix.get(start.getId()).containsKey(end.getId())) {
                return airportFareMatrix.get(start.getId()).get(end.getId());
            }
        }

        // Standard DMRC Logic (Monday to Saturday)
        double fare = 11;
        if (distanceInKm > 2 && distanceInKm <= 5) fare = 21;
        else if (distanceInKm > 5 && distanceInKm <= 12) fare = 32;
        else if (distanceInKm > 12 && distanceInKm <= 21) fare = 43;
        else if (distanceInKm > 21 && distanceInKm <= 32) fare = 54;
        else if (distanceInKm > 32) fare = 64;

        if (isSunday) {
            // Sunday Discount
            if (distanceInKm <= 2) fare = 11;
            else if (distanceInKm <= 5) fare = 11;
            else if (distanceInKm <= 12) fare = 21;
            else if (distanceInKm <= 21) fare = 32;
            else if (distanceInKm <= 32) fare = 43;
            else if (distanceInKm > 32) fare = 54;
        }

        return fare;
    }
}
