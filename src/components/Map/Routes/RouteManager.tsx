import React, { useEffect, useState } from 'react';
import { useMapContext } from '../../../contexts/MapContext';
import { fetchRoute, updateRouteOnMap, fitMapToRoute } from '../../../services/mapService';
import { RouteOption } from '../../../services/mapService';

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

// Import DirectionType from DirectionsPanel
import { DirectionType } from '../Directions/DirectionsPanel';
import { Location } from '../../../types';

export const RouteManager: React.FC = () => {
  const {
    map,
    activePanel,
    routeStartLocation,
    routeEndLocation,
    routeDirectionType,
    updateRouteInfo
  } = useMapContext();
  
  const [availableRoutes, setAvailableRoutes] = useState<RouteOption[]>([]);
  const [currentRouteIndex, setCurrentRouteIndex] = useState<number>(0);
  
  // Calculate route when inputs change
  useEffect(() => {
    if (!map || !routeStartLocation || !routeEndLocation) return;
    
    const getRoute = async () => {
      // Fetch route from Mapbox API
      const routes = await fetchRoute(
        routeStartLocation.coordinates,
        routeEndLocation.coordinates,
        routeDirectionType
      );
      
      if (routes.length === 0) return;
      
      // Store available routes
      setAvailableRoutes(routes);
      setCurrentRouteIndex(0);
      
      // Display the first route
      const route = routes[0];
      if (route.geometry && route.geometry.coordinates) {
        updateRouteOnMap(map, route.geometry.coordinates);
        
        // Fit map to show the route
        const padding = activePanel === 'directions' 
          ? { top: 50, bottom: 50, left: 350, right: 50 }
          : 50;
        
        fitMapToRoute(map, route.geometry.coordinates, padding);
      }
      
      // Update route info in context
      if (routeStartLocation && routeEndLocation) {
        updateRouteInfo({
          distance: route.distance,
          duration: route.duration,
          steps: route.steps,
          routeOptions: routes.length,
          currentRouteIndex: 0,
          startLocation: routeStartLocation,
          endLocation: routeEndLocation,
          directionType: routeDirectionType
        });
      }
    };
    
    getRoute();
  }, [map, routeStartLocation, routeEndLocation, routeDirectionType, updateRouteInfo, activePanel]);
  
  // Update route when active panel changes
  useEffect(() => {
    if (!map || availableRoutes.length === 0) return;
    
    const route = availableRoutes[currentRouteIndex];
    if (!route) return;
    
    // Adjust view to show route with appropriate padding based on panel state
    const padding = activePanel === 'directions' 
      ? { top: 50, bottom: 50, left: 350, right: 50 }
      : 50;
    
    fitMapToRoute(map, route.geometry.coordinates, padding);
  }, [activePanel, map, availableRoutes, currentRouteIndex]);
  
  // This component doesn't render anything visible
  return null;
};