package com.dmrc.metro.service;

import com.dmrc.metro.entity.Edge;
import com.dmrc.metro.entity.StationNode;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;

@Service
public class MetroDataService {

    private final Map<String, StationNode> stationNodes = new HashMap<>();
    private final Map<StationNode, List<Edge>> graph = new HashMap<>();
    private final List<StationNode> allStations = new ArrayList<>();

    @PostConstruct
    public void init() {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                getClass().getClassLoader().getResourceAsStream("Delhi metro.csv")))) {
            
            String line;
            boolean isFirstLine = true;
            StationNode previousNode = null;
            String currentLineName = "";
            double previousDistance = 0.0;
            
            while ((line = br.readLine()) != null) {
                if (isFirstLine) { isFirstLine = false; continue; } // Skip header
                if (line.trim().isEmpty()) continue;
                
                String[] cols = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                if (cols.length < 8) continue;
                
                String rawName = cols[1].replace("\"", "").trim();
                String metroLine = cols[3].trim();
                
                // Parse Dist
                double distFromStart = 0;
                try {
                    distFromStart = Double.parseDouble(cols[2]);
                } catch(NumberFormatException e) {
                    continue; // skip bad rows
                }
                
                double lat = 0, lon = 0;
                try { lat = Double.parseDouble(cols[6]); lon = Double.parseDouble(cols[7]); } catch(Exception ignored){}
                
                // Normalize Name by removing connections (e.g. "Kashmere Gate [Conn: Violet]")
                String normalizedId = rawName.replaceAll("\\[.*?\\]", "").replaceAll("\\(.*?\\)", "").trim().toLowerCase();
                String displayName = rawName.replaceAll("\\[.*?\\]", "").trim();
                
                // Reset context if new line starts
                if (!metroLine.equals(currentLineName)) {
                    previousNode = null;
                    currentLineName = metroLine;
                    previousDistance = 0.0;
                }
                
                StationNode node = stationNodes.get(normalizedId);
                if (node == null) {
                    node = new StationNode(normalizedId, displayName, lat, lon, metroLine);
                    stationNodes.put(normalizedId, node);
                    allStations.add(node);
                    graph.put(node, new ArrayList<>());
                } else {
                    node.addLine(metroLine);
                }
                
                // create edge with previous node
                if (previousNode != null) {
                    double edgeDist = Math.abs(distFromStart - previousDistance);
                    // bi-directional
                    graph.get(previousNode).add(new Edge(node, edgeDist, metroLine));
                    graph.get(node).add(new Edge(previousNode, edgeDist, metroLine));
                }
                
                previousNode = node;
                previousDistance = distFromStart;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Map<StationNode, List<Edge>> getGraph() {
        return graph;
    }

    public StationNode getStation(String id) {
        return stationNodes.get(id.toLowerCase());
    }

    public List<StationNode> getAllStations() {
        return allStations;
    }
}
