import mapboxgl from 'mapbox-gl';
import { DirectionType } from '../components/Map/Directions/DirectionsPanel';

// Initialize Mapbox access token - this should be moved to an initialization step
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

// Map style constants
export const MAP_STYLES = {
  map: 'streets-v11',
  satellite: 'satellite-v9'
};

// Route constants
export const ROUTE_SOURCE_ID = 'route';
export const ROUTE_LAYER_ID = 'route-line';
export const DEFAULT_LOCATION: [number, number] = [144.9631, -37.8136]; // Melbourne, Australia [lng, lat]
export const DEFAULT_ZOOM = 12;

// Map different route colors based on direction type
export const ROUTE_COLORS = {
  walking: '#15a451', // greenish
  cycling: '#8c31b1', // purplish
  driving: '#1e7fbf'  // blueish
};

export interface RouteOption {
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

/**
 * Initialize a new Mapbox map instance
 */
export const initializeMap = (
  container: HTMLElement,
  center: [number, number] = DEFAULT_LOCATION,
  zoom: number = DEFAULT_ZOOM,
  style: string = 'streets-v11'
): mapboxgl.Map => {
  // Create a new map instance
  const map = new mapboxgl.Map({
    container,
    style: `mapbox://styles/mapbox/${style}`,
    center,
    zoom
  });

  // Add standard controls
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  
  // Add geolocation control
  const geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
      timeout: 6000
    },
    trackUserLocation: true,
    showUserHeading: true,
    showAccuracyCircle: true
  });
  
  map.addControl(geolocateControl, 'top-right');
  
  return map;
};

/**
 * Change the map style
 */
export const changeMapStyle = (
  map: mapboxgl.Map,
  style: string
): void => {
  if (!map) return;
  
  // Store current view state
  const currentCenter = map.getCenter();
  const currentZoom = map.getZoom();
  
  // Change style
  map.setStyle(`mapbox://styles/mapbox/${style}`);
  
  // Restore view after style loads
  map.once('style.load', () => {
    map.setCenter(currentCenter);
    map.setZoom(currentZoom);
  });
};

/**
 * Initialize or reset the route layer on the map
 */
export const setupRouteLayer = (
  map: mapboxgl.Map,
  directionType: DirectionType = 'walking'
): void => {
  if (!map) return;

  // Remove existing layer and source if they exist
  if (map.getSource(ROUTE_SOURCE_ID)) {
    if (map.getLayer(ROUTE_LAYER_ID)) {
      map.removeLayer(ROUTE_LAYER_ID);
    }
    map.removeSource(ROUTE_SOURCE_ID);
  }

  // Add new source and layer
  try {
    map.addSource(ROUTE_SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    });

    map.addLayer({
      id: ROUTE_LAYER_ID,
      type: 'line',
      source: ROUTE_SOURCE_ID,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': ROUTE_COLORS[directionType],
        'line-width': 4,
        'line-opacity': 0.8
      }
    });
  } catch (e) {
    console.error('Failed to add route layer:', e);
  }
};

/**
 * Update the route on the map
 */
export const updateRouteOnMap = (
  map: mapboxgl.Map,
  coordinates: [number, number][]
): void => {
  if (!map || !coordinates || coordinates.length === 0) return;
  
  // Update route on the map
  try {
    const source = map.getSource(ROUTE_SOURCE_ID) as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      });
    }
  } catch (error) {
    console.error('Error updating route on map:', error);
  }
};

/**
 * Fit map view to show the route
 */
export const fitMapToRoute = (
  map: mapboxgl.Map,
  coordinates: [number, number][],
  padding: number | mapboxgl.PaddingOptions = 50
): void => {
  if (!map || !coordinates || coordinates.length === 0) return;
  
  // Create bounds that include all coordinates
  const bounds = coordinates.reduce((bounds, coord) => {
    return bounds.extend(coord);
  }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
  
  // Fit the map to the bounds
  map.fitBounds(bounds, {
    padding,
    duration: 1000
  });
};

/**
 * Fetch route from Mapbox Directions API
 */
export const fetchRoute = async (
  startCoords: [number, number],
  endCoords: [number, number],
  directionType: DirectionType
): Promise<RouteOption[]> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/${directionType}/` +
      `${startCoords[0]},${startCoords[1]};` +
      `${endCoords[0]},${endCoords[1]}?` +
      `geometries=geojson&overview=full&steps=true&alternatives=true&` +
      `access_token=${mapboxgl.accessToken}`
    );
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      console.warn('No routes found');
      return [];
    }
    
    // Transform API response into our RouteOption format
    return data.routes.map((route: any, index: number) => ({
      index,
      distance: route.distance,
      duration: route.duration,
      steps: route.legs[0].steps,
      geometry: route.geometry
    }));
  } catch (error) {
    console.error('Error fetching route:', error);
    return [];
  }
};