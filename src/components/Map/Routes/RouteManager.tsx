import React, { useEffect, useState } from 'react';
import { useMapContext } from '../../../contexts/MapContext';
import { fetchRoute, updateRouteOnMap, fitMapToRoute, setupRouteLayer, RouteOption } from '../../../services/mapService';

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
  startLocation?: Location | null;
  endLocation?: Location | null;
  directionType?: DirectionType;
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
    updateRouteInfo,
    currentRouteIndex
  } = useMapContext();
  
  // State to hold all fetched routes for the current origin/destination/type
  const [availableRoutes, setAvailableRoutes] = useState<RouteOption[]>([]);
  
  // Effect 1: Fetch routes when parameters change
  useEffect(() => {
    // Ensure we have map and both locations selected
    if (!map || !routeStartLocation || !routeEndLocation) {
      setAvailableRoutes([]); // Clear old routes if parameters are incomplete
      updateRouteInfo(null); // Clear route info in context
      return;
    }
    
    let isMounted = true; // Flag to prevent state updates if component unmounts during fetch

    const getRoute = async () => {
      try {
        // Fetch all alternative routes from Mapbox API
        const routes = await fetchRoute(
          routeStartLocation.coordinates,
          routeEndLocation.coordinates,
          routeDirectionType
        );
        
        if (!isMounted) return; // Don't update state if unmounted

        if (routes.length > 0) {
          setAvailableRoutes(routes);
          // Note: The display update (map and info panel) will be handled
          // by the second useEffect, triggered by the change in availableRoutes
          // or if currentRouteIndex is already non-zero.
        } else {
          // No routes found
          setAvailableRoutes([]);
          updateRouteInfo(null); // Clear context info
          // Maybe add user feedback here (e.g., toast notification)
          console.warn("No routes found for the selected criteria.");
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching route:", error);
        setAvailableRoutes([]);
        updateRouteInfo(null); // Clear context info on error
      }
    };
    
    getRoute();

    // Cleanup function to set the mounted flag to false
    return () => {
      isMounted = false;
    };
  }, [map, routeStartLocation, routeEndLocation, routeDirectionType]); 
  
  // Effect 2: Display the selected route when routes are available or the index changes
  useEffect(() => {
    // Ensure map is ready and routes have been loaded
    if (!map || availableRoutes.length === 0) return;
    
    // Validate the index from context
    const validIndex = currentRouteIndex >= 0 && currentRouteIndex < availableRoutes.length 
                         ? currentRouteIndex 
                         : 0; // Default to 0 if index is invalid

    // Get the selected route based on the (validated) context index
    const route = availableRoutes[validIndex];
    if (!route) return; // Should not happen if logic is correct, but safeguard
    
    // Ensure the map layer uses the correct color/style for the current direction type
    setupRouteLayer(map, routeDirectionType);
    
    // Update the route line on the map
    if (route.geometry && route.geometry.coordinates) {
      updateRouteOnMap(map, route.geometry.coordinates);
    
      // Adjust map view to fit the route, considering the active panel for padding
      const padding = activePanel === 'directions' 
        ? { top: 50, bottom: 50, left: 350, right: 50 } // More padding on left if directions panel is open
        : 50; // Default padding
      fitMapToRoute(map, route.geometry.coordinates, padding);

      // Update the route information in the context
      // This will update the DirectionsPanel display
      updateRouteInfo({
        distance: route.distance,
        duration: route.duration,
        steps: route.steps,
        routeOptions: availableRoutes.length,
        currentRouteIndex: validIndex,
        startLocation: routeStartLocation, 
        endLocation: routeEndLocation,
        directionType: routeDirectionType
      });
    } else {
      // Handle case where selected route has no geometry (should be rare)
      console.warn("Selected route is missing geometry:", route);
      updateRouteInfo(null); // Clear info if route is invalid
    }

  }, [map, availableRoutes, currentRouteIndex, activePanel, routeDirectionType, updateRouteInfo, routeStartLocation, routeEndLocation]); 
  
  // This component does not render any visible UI elements itself
  return null;
};