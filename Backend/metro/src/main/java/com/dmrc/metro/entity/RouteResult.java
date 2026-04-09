package com.dmrc.metro.entity;

import java.util.List;

public class RouteResult {
    public static class RouteLeg {
        private String lineName;
        private List<StationNode> stations;

        public RouteLeg() {}
        public RouteLeg(String lineName, List<StationNode> stations) {
            this.lineName = lineName;
            this.stations = stations;
        }

        public String getLineName() { return lineName; }
        public void setLineName(String lineName) { this.lineName = lineName; }
        public List<StationNode> getStations() { return stations; }
        public void setStations(List<StationNode> stations) { this.stations = stations; }
    }

    private List<RouteLeg> legs;
    private double totalDistance;
    private int estimatedTimeMinutes;
    private int totalStations;
    private int interchangesCount;
    private List<String> linesUsed;
    private double fare;

    public RouteResult() {}

    // getters and setters
    public List<RouteLeg> getLegs() { return legs; }
    public void setLegs(List<RouteLeg> legs) { this.legs = legs; }

    public double getTotalDistance() { return totalDistance; }
    public void setTotalDistance(double totalDistance) { this.totalDistance = totalDistance; }

    public int getEstimatedTimeMinutes() { return estimatedTimeMinutes; }
    public void setEstimatedTimeMinutes(int estimatedTimeMinutes) { this.estimatedTimeMinutes = estimatedTimeMinutes; }

    public int getTotalStations() { return totalStations; }
    public void setTotalStations(int totalStations) { this.totalStations = totalStations; }

    public int getInterchangesCount() { return interchangesCount; }
    public void setInterchangesCount(int interchangesCount) { this.interchangesCount = interchangesCount; }

    public List<String> getLinesUsed() { return linesUsed; }
    public void setLinesUsed(List<String> linesUsed) { this.linesUsed = linesUsed; }

    public double getFare() { return fare; }
    public void setFare(double fare) { this.fare = fare; }
}
