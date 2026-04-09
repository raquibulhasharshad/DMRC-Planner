package com.dmrc.metro.service;

import com.dmrc.metro.entity.Edge;
import com.dmrc.metro.entity.RouteResult;
import com.dmrc.metro.entity.StationNode;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RoutingService {

    private final MetroDataService dataService;
    private final FareCalculator fareCalculator;
    
    // An interchange adds a small penalty to prevent unnecessary hopping
    private static final double INTERCHANGE_PENALTY_KM = 2.0;

    public RoutingService(MetroDataService dataService, FareCalculator fareCalculator) {
        this.dataService = dataService;
        this.fareCalculator = fareCalculator;
    }

    public RouteResult findShortestRoute(String fromId, String toId, boolean isSunday) {
        StationNode start = dataService.getStation(fromId);
        StationNode end = dataService.getStation(toId);

        if (start == null || end == null) return null; // Invalid IDs

        Map<StationNode, Double> distances = new HashMap<>();
        Map<StationNode, StationNode> previous = new HashMap<>();
        Map<StationNode, String> previousLine = new HashMap<>();
        
        PriorityQueue<NodeQueueItem> pq = new PriorityQueue<>(Comparator.comparingDouble(a -> a.distance));

        for (StationNode node : dataService.getGraph().keySet()) {
            distances.put(node, Double.MAX_VALUE);
        }

        distances.put(start, 0.0);
        pq.add(new NodeQueueItem(start, 0.0, null));

        while (!pq.isEmpty()) {
            NodeQueueItem currentItem = pq.poll();
            StationNode current = currentItem.node;

            if (current.equals(end)) break; // Found shortest path

            if (currentItem.distance > distances.get(current)) continue;

            for (Edge edge : dataService.getGraph().get(current)) {
                StationNode neighbor = edge.getDestination();
                double newDist = distances.get(current) + edge.getDistance();
                
                // Add penalty if line changes
                if (currentItem.line != null && !currentItem.line.equals(edge.getLine())) {
                    newDist += INTERCHANGE_PENALTY_KM;
                }

                if (newDist < distances.get(neighbor)) {
                    distances.put(neighbor, newDist);
                    previous.put(neighbor, current);
                    previousLine.put(neighbor, edge.getLine());
                    pq.add(new NodeQueueItem(neighbor, newDist, edge.getLine()));
                }
            }
        }

        // Reconstruct path
        List<StationNode> path = new ArrayList<>();
        StationNode curr = end;
        while (curr != null) {
            path.add(curr);
            curr = previous.get(curr);
        }
        Collections.reverse(path);

        // Build result
        RouteResult result = new RouteResult();
        result.setTotalStations(path.size() - 1);
        
        Set<String> linesUsed = new HashSet<>();
        int interchanges = 0;
        double realDistance = 0.0;
        
        List<RouteResult.RouteLeg> legs = new ArrayList<>();
        RouteResult.RouteLeg currentLeg = null;
        
        for (int i = 0; i < path.size() - 1; i++) {
            StationNode n1 = path.get(i);
            StationNode n2 = path.get(i+1);
            
            // Find edge connecting them
            Edge connectedEdge = null;
            for(Edge e : dataService.getGraph().get(n1)) {
                if(e.getDestination().equals(n2)) {
                    connectedEdge = e; break;
                }
            }
            if(connectedEdge != null) {
                realDistance += connectedEdge.getDistance();
                linesUsed.add(connectedEdge.getLine());
                
                String currLine = connectedEdge.getLine();
                
                if (currentLeg == null) {
                    currentLeg = new RouteResult.RouteLeg(currLine, new ArrayList<>());
                    currentLeg.getStations().add(n1);
                } else if (!currentLeg.getLineName().equals(currLine)) {
                    legs.add(currentLeg);
                    interchanges++;
                    currentLeg = new RouteResult.RouteLeg(currLine, new ArrayList<>());
                    currentLeg.getStations().add(n1); // Interchange station opens the new leg too
                }
                currentLeg.getStations().add(n2);
            }
        }
        if (currentLeg != null) {
            legs.add(currentLeg);
        }
        
        result.setLegs(legs);
        result.setTotalDistance(Math.round(realDistance * 100.0) / 100.0);
        result.setInterchangesCount(interchanges);
        result.setLinesUsed(new ArrayList<>(linesUsed));
        
        // Estimated time: ~35 km/h avg speed + 5 min per interchange
        int minutes = (int) Math.round((result.getTotalDistance() / 35.0) * 60.0) + (interchanges * 5);
        result.setEstimatedTimeMinutes(minutes);
        
        result.setFare(fareCalculator.calculateFare(path, realDistance, isSunday));

        return result;
    }

    private static class NodeQueueItem {
        StationNode node;
        double distance;
        String line;

        NodeQueueItem(StationNode node, double distance, String line) {
            this.node = node;
            this.distance = distance;
            this.line = line;
        }
    }
}
