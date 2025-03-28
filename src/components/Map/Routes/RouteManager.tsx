import React, { useEffect, useState } from 'react';
import { useMapContext } from '../../../contexts/MapContext';
import { fetchRoute, updateRouteOnMap, fitMapToRoute, setupRouteLayer } from '../../../services/mapService';
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
    routeInfo,
    updateRouteInfo
  } = useMapContext();
  
  const [availableRoutes, setAvailableRoutes] = useState<RouteOption[]>([]);
  const [currentRouteIndex, setCurrentRouteIndex] = useState<number>(0);
  
  // Calculate route when inputs change
  useEffect(() => {
    if (!map || !routeStartLocation || !routeEndLocation) return;
    
    const getRoute = async () => {
      // Ensure route layer is set up with the correct color for this direction type
      setupRouteLayer(map, routeDirectionType);
      
      // Fetch route from Mapbox API
      const routes = await fetchRoute(
        routeStartLocation.coordinates,
        routeEndLocation.coordinates,
        routeDirectionType
      );
      
      if (routes.length === 0) return;
      
      // Store available routes
      setAvailableRoutes(routes);
      
      // Display the first route
      const route = routes[0];
      if (route.geometry && route.geometry.coordinates) {
        // Update route info in context (will trigger the other effect to display the route)
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
      }
    };
    
    getRoute();
  }, [map, routeStartLocation, routeEndLocation, routeDirectionType, updateRouteInfo, activePanel]);
  
  // Display the selected route when routes are available or route index changes
  useEffect(() => {
    if (!map || availableRoutes.length === 0) return;
    
    // Use the route index from context, defaulting to local state if not available
    const routeIndex = routeInfo?.currentRouteIndex !== undefined ? routeInfo.currentRouteIndex : currentRouteIndex;
    
    // Update local state if needed (for initial load)
    if (routeIndex !== currentRouteIndex) {
      setCurrentRouteIndex(routeIndex);
    }
    
    const route = availableRoutes[routeIndex];
    if (!route) return;
    
    // Make sure the layer has the right color before updating
    setupRouteLayer(map, routeDirectionType);
    
    // Update route on map
    updateRouteOnMap(map, route.geometry.coordinates);
    
    // Adjust view to show route with appropriate padding based on panel state
    const padding = activePanel === 'directions' 
      ? { top: 50, bottom: 50, left: 350, right: 50 }
      : 50;
    
    fitMapToRoute(map, route.geometry.coordinates, padding);
  }, [map, availableRoutes, activePanel, routeInfo, currentRouteIndex, routeDirectionType, setCurrentRouteIndex]);
  
  // This component doesn't render anything visible
  return null;
};