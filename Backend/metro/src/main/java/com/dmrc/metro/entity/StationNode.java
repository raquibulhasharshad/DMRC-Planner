package com.dmrc.metro.entity;

import java.util.Objects;
import java.util.Set;
import java.util.HashSet;

public class StationNode {
    private String id; // We will use Station Name without [Conn] as the unique logical ID
    private String displayName;
    private double latitude;
    private double longitude;
    private Set<String> lines;

    public StationNode(String id, String displayName, double latitude, double longitude, String line) {
        this.id = id;
        this.displayName = displayName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.lines = new HashSet<>();
        this.lines.add(line);
    }

    public String getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public Set<String> getLines() {
        return lines;
    }

    public void addLine(String line) {
        this.lines.add(line);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StationNode that = (StationNode) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
