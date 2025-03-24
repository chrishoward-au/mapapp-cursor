import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Location } from '../../../types';
import { DirectionType } from '../Directions/DirectionsPanel';

// Constants from Map.tsx
const ROUTE_SOURCE_ID = 'route';
const ROUTE_LAYER_ID = 'route-line';
const ROUTE_COLORS = {
  walking: '#25a244', // green
  cycling: '#e83e8c', // magenta
  driving: '#3b82f6'  // blue
};

// Interface for route info passed back to parent
export interface RouteInfo {
  distance: number;
  duration: number;
  steps: Array<{
    maneuver: {
      instruction: string;
    };
    distance: number;
  }>;
  routeOptions?: number;
  currentRouteIndex?: number;
  startLocation: Location;
  endLocation: Location;
  directionType: DirectionType;
}

// Interface for storing multiple routes
interface RouteOption {
  index: number;
  distance: number;
  duration: number;
  steps: Array<{
    maneuver: {
      instruction: string;
    };
    distance: number;
  }>;
  geometry: {
    coordinates: [number, number][];
  };
}

interface RouteManagerProps {
  map: mapboxgl.Map;
  startLocation: Location;
  endLocation: Location;
  directionType: DirectionType;
  activePanel: string;
  onRouteInfoUpdate?: (routeInfo: RouteInfo) => void;
}

export const RouteManager: React.FC<RouteManagerProps> = ({
  map,
  startLocation,
  endLocation,
  directionType,
  activePanel,
  onRouteInfoUpdate
}) => {
  const [availableRoutes, setAvailableRoutes] = useState<RouteOption[]>([]);
  const [currentRouteIndex, setCurrentRouteIndex] = useState<number>(0);
  
  // Calculate route when inputs change
  useEffect(() => {
    calculateRoute();
  }, [map, startLocation, endLocation, directionType]);
  
  // Effect to fit bounds when activePanel changes
  useEffect(() => {
    if (availableRoutes.length > 0) {
      const route = availableRoutes[currentRouteIndex];
      fitMapToRoute(route.geometry.coordinates);
    }
  }, [activePanel]);
  
  const calculateRoute = async () => {
    try {
      // Update route line color based on the direction type
      if (map.getLayer(ROUTE_LAYER_ID)) {
        map.setPaintProperty(ROUTE_LAYER_ID, 'line-color', ROUTE_COLORS[directionType]);
      }

      // Get route from Mapbox Directions API - using the selected profile
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${directionType}/` +
        `${startLocation.coordinates[0]},${startLocation.coordinates[1]};` +
        `${endLocation.coordinates[0]},${endLocation.coordinates[1]}?` +
        `geometries=geojson&overview=full&steps=true&alternatives=true&` +
        `access_token=${mapboxgl.accessToken}`
      );
      
      const json = await query.json();

      if (!json.routes || json.routes.length === 0) {
        console.warn('No routes found');
        return;
      }
      
      // Store all available routes
      const routes = json.routes.map((route: any, index: number) => ({
        index,
        distance: route.distance,
        duration: route.duration,
        steps: route.legs[0].steps,
        geometry: route.geometry
      }));
      
      setAvailableRoutes(routes);
      setCurrentRouteIndex(0);
      
      // Display the first route by default
      const route = routes[0];
      
      if (route.geometry && route.geometry.coordinates) {
        updateMapWithRoute(route.geometry.coordinates);
        fitMapToRoute(route.geometry.coordinates);
      }
      
      // Return info to parent
      if (onRouteInfoUpdate) {
        onRouteInfoUpdate({
          distance: route.distance,
          duration: route.duration,
          steps: route.steps,
          routeOptions: routes.length,
          currentRouteIndex: 0,
          startLocation,
          endLocation,
          directionType
        });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };
  
  const updateMapWithRoute = (coordinates: [number, number][]) => {
    if (!coordinates || coordinates.length === 0) return;
    
    // Update route on the map
    if (map.getSource(ROUTE_SOURCE_ID)) {
      (map.getSource(ROUTE_SOURCE_ID) as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      });
    }
  };
  
  const fitMapToRoute = (coordinates: [number, number][]) => {
    if (!coordinates || coordinates.length === 0) return;
    
    // Create bounds that fit all route coordinates
    const bounds = new mapboxgl.LngLatBounds();
    
    // Add valid coordinates to bounds
    for (const coord of coordinates) {
      if (coord && coord.length >= 2) {
        bounds.extend([coord[0], coord[1]]);
      }
    }
    
    if (!bounds.isEmpty()) {
      // Fit to bounds with appropriate padding
      map.fitBounds(bounds, {
        padding: { 
          top: 50, 
          bottom: 50, 
          left: activePanel === 'directions' ? 350 : 50, 
          right: 50 
        },
        duration: 1000
      });
    }
  };
  
  return null; // This is a logic-only component
}; 