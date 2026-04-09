package com.dmrc.metro.entity;

public class Edge {
    private StationNode destination;
    private double distance; // in km
    private String line;

    public Edge(StationNode destination, double distance, String line) {
        this.destination = destination;
        this.distance = distance;
        this.line = line;
    }

    public StationNode getDestination() {
        return destination;
    }

    public double getDistance() {
        return distance;
    }

    public String getLine() {
        return line;
    }
}
