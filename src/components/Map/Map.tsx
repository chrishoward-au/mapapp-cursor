import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './Map.module.css';
import { LocationMarker } from './LocationMarker';
import { LocationList } from './LocationList';
import { DirectionsPanel, DirectionType } from './Directions/DirectionsPanel';
import { AddLocationModal } from './AddLocationModal';
import { Location, UserPreferences } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '../../services/storage';
import { DarkModeToggle } from '../DarkModeToggle';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  List, 
  Compass, 
  Maximize, 
  Map as MapIcon, 
  Globe,
  Bike,
  Car
} from 'lucide-react';

// Initialize Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MAP_STYLES = {
  map: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
};

const ROUTE_SOURCE_ID = 'route';
const ROUTE_LAYER_ID = 'route-line';
const DEFAULT_LOCATION: [number, number] = [144.9631, -37.8136]; // Melbourne, Australia [lng, lat]
const DEFAULT_ZOOM = 12;

// Map different route colors based on direction type
const ROUTE_COLORS = {
  walking: '#4264fb', // blue
  cycling: '#10b981', // green
  driving: '#f59e0b'  // amber
};

export const Map = () => {
  const { theme } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const geolocateControl = useRef<mapboxgl.GeolocateControl | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [activePanel, setActivePanel] = useState<'none' | 'locations' | 'directions'>('none');
  const [locations, setLocations] = useState<Location[]>([]);
  const [mapStyle, setMapStyle] = useState<UserPreferences['defaultMapLayer']>('map');
  const [markersKey, setMarkersKey] = useState(0); // Add a key to force marker re-creation
  const [isLoading, setIsLoading] = useState(true);
  const [currentRouteType, setCurrentRouteType] = useState<DirectionType>('walking');
  
  // Store route state at Map level to preserve it when panel is closed
  const [routeStartLocation, setRouteStartLocation] = useState<Location | null>(null);
  const [routeEndLocation, setRouteEndLocation] = useState<Location | null>(null);
  const [routeDirectionType, setRouteDirectionType] = useState<DirectionType>('walking');
  
  // Add state for the modal
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [newLocationCoordinates, setNewLocationCoordinates] = useState<[number, number] | null>(null);
  
  // Load locations from storage on component mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setIsLoading(true);
        const storedLocations = await storageService.getLocations();
        setLocations(storedLocations);
      } catch (error) {
        console.error('Failed to load locations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLocations();
  }, []);

  // Get the user's location using browser's geolocation
  const getUserLocation = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          resolve([longitude, latitude]);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  };

  // Initialize map
  useEffect(() => {
    const containerElement = mapContainer.current;
    if (!containerElement) return;

    const initMap = async () => {
      // Try to get user location, default to Melbourne if not available
      let initialCenter: [number, number] = DEFAULT_LOCATION;
      try {
        initialCenter = await getUserLocation();
        console.info('Using user location:', initialCenter);
      } catch (error) {
        console.info('Using default location (Melbourne):', DEFAULT_LOCATION);
      }

      // Initialize map with the original map style (not theme-dependent)
      map.current = new mapboxgl.Map({
        container: containerElement,
        style: MAP_STYLES[mapStyle],
        center: initialCenter,
        zoom: DEFAULT_ZOOM
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Create geolocate control with more options and store it in ref
      geolocateControl.current = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
          timeout: 6000
        },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: true
      });
      
      // Add the geolocate control to the map
      map.current.addControl(geolocateControl.current, 'top-right');

      // Wait for map to fully load before setting initialized state
      map.current.on('load', () => {
        addRouteLayer();
        setIsMapInitialized(true);
        setMarkersKey(prev => prev + 1);
        
        // Trigger the geolocate control automatically after map loads
        setTimeout(() => {
          if (geolocateControl.current) {
            geolocateControl.current.trigger();
          }
        }, 1000);
      });

      // Replace prompt with modal for adding locations
      map.current.on('click', (e) => {
        const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        setNewLocationCoordinates(coordinates);
        setIsAddLocationModalOpen(true);
      });
    };

    initMap();

    // Cleanup on unmount
    return () => {
      map.current?.remove();
      setIsMapInitialized(false);
    };
  }, []); // Only run once on mount

  // Handle map style changes
  useEffect(() => {
    if (!map.current || !isMapInitialized) return;

    // Don't run on initial render when mapStyle is just initialized
    try {
      const currentStyle = map.current.getStyle();
      if (currentStyle && currentStyle.name === MAP_STYLES[mapStyle]) return;
    } catch (e) {
      // Style might not be available yet
      return;
    }
    
    const currentCenter = map.current.getCenter();
    const currentZoom = map.current.getZoom();

    // Simple approach - just set the style and restore view after a brief delay
    map.current.setStyle(MAP_STYLES[mapStyle]);
    
    // Let the styledata event in LocationMarker handle marker re-creation
    setTimeout(() => {
      if (map.current) {
        map.current.setCenter(currentCenter);
        map.current.setZoom(currentZoom);
        addRouteLayer();
      }
    }, 150);
    
  }, [mapStyle, isMapInitialized]); // Don't react to theme changes for map style

  // Save locations whenever they change
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load
    
    const saveLocationsToStorage = async () => {
      try {
        await storageService.saveLocations(locations);
      } catch (error) {
        console.error('Failed to save locations:', error);
      }
    };
    
    saveLocationsToStorage();
  }, [locations, isLoading]);

  const addRouteLayer = () => {
    if (!map.current) return;

    // Check if source already exists and remove it
    if (map.current.getSource(ROUTE_SOURCE_ID)) {
      if (map.current.getLayer(ROUTE_LAYER_ID)) {
        map.current.removeLayer(ROUTE_LAYER_ID);
      }
      map.current.removeSource(ROUTE_SOURCE_ID);
    }

    // Add route source and layer
    try {
      map.current.addSource(ROUTE_SOURCE_ID, {
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

      map.current.addLayer({
        id: ROUTE_LAYER_ID,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': ROUTE_COLORS[currentRouteType],
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
    } catch (e) {
      console.error('Failed to add route layer:', e);
    }
  };

  const handleLayerChange = (layer: UserPreferences['defaultMapLayer']) => {
    if (!map.current) return;
    setMapStyle(layer);
  };

  const togglePanel = (panel: 'locations' | 'directions') => {
    setActivePanel(current => current === panel ? 'none' : panel);
  };

  const handleLocationSelect = (location: Location) => {
    if (map.current) {
      map.current.flyTo({
        center: location.coordinates,
        zoom: 14
      });
    }
  };

  const handleLocationDelete = (locationId: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== locationId));
  };

  const handleRouteSelect = async (start: Location, end: Location, directionType: DirectionType = 'walking') => {
    if (!map.current) return;

    try {
      // Store the current route type for use in styling
      setCurrentRouteType(directionType);
      
      // Store the route state
      setRouteStartLocation(start);
      setRouteEndLocation(end);
      setRouteDirectionType(directionType);

      // Update route line color based on the direction type
      if (map.current.getLayer(ROUTE_LAYER_ID)) {
        map.current.setPaintProperty(ROUTE_LAYER_ID, 'line-color', ROUTE_COLORS[directionType]);
      }

      // Get route from Mapbox Directions API - using the selected profile (walking, cycling, driving)
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${directionType}/${start.coordinates[0]},${start.coordinates[1]};${end.coordinates[0]},${end.coordinates[1]}?geometries=geojson&overview=full&steps=true&access_token=${mapboxgl.accessToken}`
      );
      const json = await query.json();

      if (json.routes?.[0]) {
        const route = json.routes[0];
        const coordinates = route.geometry.coordinates;

        // Update route on the map
        if (map.current.getSource(ROUTE_SOURCE_ID)) {
          (map.current.getSource(ROUTE_SOURCE_ID) as mapboxgl.GeoJSONSource).setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates
            }
          });
        }

        // Fit map to route bounds
        const bounds = coordinates.reduce(
          (bounds: mapboxgl.LngLatBounds, coord: [number, number]) => bounds.extend(coord),
          new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
        );

        map.current.fitBounds(bounds, {
          padding: 50,
          duration: 1000
        });
        
        // No longer auto-close the panel after route calculation
        // setActivePanel('none');

        return {
          distance: route.distance,
          duration: route.duration,
          steps: route.legs[0].steps
        };
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  // Add handler for saving a new location from the modal
  const handleSaveLocation = (name: string) => {
    if (newLocationCoordinates) {
      const newLocation: Location = {
        id: uuidv4(),
        name,
        coordinates: newLocationCoordinates,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setLocations(prev => [...prev, newLocation]);
      setIsAddLocationModalOpen(false);
      setNewLocationCoordinates(null);
    }
  };

  // Add handler for canceling the modal
  const handleCancelAddLocation = () => {
    setIsAddLocationModalOpen(false);
    setNewLocationCoordinates(null);
  };

  // Add handler for fitting the map to show all markers
  const handleFitAllMarkers = () => {
    if (!map.current || locations.length === 0) return;
    
    // Create a new bounds object
    const bounds = new mapboxgl.LngLatBounds();
    
    // Extend the bounds to include all marker locations
    locations.forEach(location => {
      bounds.extend(location.coordinates as [number, number]);
    });
    
    // Fit the map to the bounds with some padding
    map.current.fitBounds(bounds, {
      padding: 50,
      duration: 1000
    });
  };

  // Handle map resize when panel state changes
  useEffect(() => {
    if (!map.current || !isMapInitialized) return;
    
    // Resize immediately and then again after transition completes
    map.current.resize();
    
    const resizeTimer = setTimeout(() => {
      if (map.current) {
        map.current.resize();
        
        // For routes, ensure they remain visible after resize
        if (activePanel === 'directions' && routeStartLocation && routeEndLocation) {
          try {
            // Get current route coordinates
            const source = map.current.getSource(ROUTE_SOURCE_ID);
            if (source && 'getGeoJSON' in source) {
              const geojson = (source as any).getGeoJSON();
              if (geojson && 
                  typeof geojson === 'object' && 
                  'geometry' in geojson && 
                  geojson.geometry && 
                  'coordinates' in geojson.geometry) {
                
                const coordinates = geojson.geometry.coordinates;
                
                if (Array.isArray(coordinates) && coordinates.length > 0) {
                  // Create bounds that fit all route coordinates
                  const bounds = coordinates.reduce(
                    (bounds: mapboxgl.LngLatBounds, coord: [number, number]) => bounds.extend(coord),
                    new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
                  );
                  
                  // Fit to bounds with a slight delay to ensure UI has settled
                  map.current.fitBounds(bounds, {
                    padding: { top: 50, bottom: 50, left: 350, right: 50 }, // Extra padding on left for panel
                    duration: 500
                  });
                }
              }
            }
          } catch (error) {
            console.warn('Error adjusting route view after resize:', error);
          }
        }
      }
    }, 350);
    
    return () => clearTimeout(resizeTimer);
  }, [activePanel, isMapInitialized, routeStartLocation, routeEndLocation]);

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.mapWrapper} ${activePanel !== 'none' ? styles.withPanel : ''}`}>
        <div ref={mapContainer} className={styles.mapContainer} />
        {isMapInitialized && map.current && (
          <div key={markersKey}>
            {locations.map(location => (
              <LocationMarker
                key={location.id}
                map={map.current as mapboxgl.Map}
                location={location}
                onClick={handleLocationSelect}
              />
            ))}
          </div>
        )}
      </div>

      <div className={`${styles.panel} ${activePanel === 'none' ? styles.hidden : ''}`}>
        {activePanel === 'locations' && (
          <LocationList
            locations={locations}
            onLocationSelect={handleLocationSelect}
            onLocationDelete={handleLocationDelete}
            onClose={() => setActivePanel('none')}
          />
        )}
        {activePanel === 'directions' && (
          <DirectionsPanel
            locations={locations}
            onRouteSelect={handleRouteSelect}
            startLocation={routeStartLocation}
            endLocation={routeEndLocation}
            directionType={routeDirectionType}
            onStartLocationChange={setRouteStartLocation}
            onEndLocationChange={setRouteEndLocation}
            onDirectionTypeChange={setRouteDirectionType}
            onClose={() => setActivePanel('none')}
          />
        )}
      </div>

      <div className={styles.actionBar}>
        <button
          className={`${styles.actionButton} ${activePanel === 'locations' ? styles.active : ''}`}
          onClick={() => togglePanel('locations')}
        >
          <List size={20} />
        </button>
        <button
          className={`${styles.actionButton} ${activePanel === 'directions' ? styles.active : ''}`}
          onClick={() => togglePanel('directions')}
        >
          <Compass size={20} />
        </button>
        
        <button
          className={`${styles.actionButton}`}
          onClick={handleFitAllMarkers}
          title="View all locations"
          disabled={locations.length === 0}
        >
          <Maximize size={20} />
        </button>
        
        <button
          className={`${styles.actionButton}`}
          onClick={() => handleLayerChange(mapStyle === 'map' ? 'satellite' : 'map')}
          title={mapStyle === 'map' ? 'Switch to satellite view' : 'Switch to map view'}
        >
          {mapStyle === 'map' ? (
            <Globe size={20} />
          ) : (
            <MapIcon size={20} />
          )}
        </button>
        
        <DarkModeToggle />
      </div>

      {/* Add the modal to the component */}
      <AddLocationModal
        isOpen={isAddLocationModalOpen}
        coordinates={newLocationCoordinates}
        onSave={handleSaveLocation}
        onCancel={handleCancelAddLocation}
      />
    </div>
  );
}; 