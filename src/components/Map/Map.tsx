import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './Map.module.css';
import { LocationMarker } from './LocationMarker';
import { LocationList } from './LocationList';
import { DirectionsPanel } from './Directions/DirectionsPanel';
import { Location, UserPreferences } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '../../services/storage';
import DarkModeToggle from '../UI/DarkModeToggle';
import { useTheme } from '../../contexts/ThemeContext';

// Initialize Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MAP_STYLES = {
  light: {
    map: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
  },
  dark: {
    map: 'mapbox://styles/mapbox/dark-v11',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
  }
};

const ROUTE_SOURCE_ID = 'route';
const ROUTE_LAYER_ID = 'route-line';
const DEFAULT_LOCATION: [number, number] = [144.9631, -37.8136]; // Melbourne, Australia [lng, lat]
const DEFAULT_ZOOM = 12;

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const geolocateControl = useRef<mapboxgl.GeolocateControl | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [activePanel, setActivePanel] = useState<'none' | 'locations' | 'directions'>('none');
  const [locations, setLocations] = useState<Location[]>([]);
  const [mapStyle, setMapStyle] = useState<UserPreferences['defaultMapLayer']>('map');
  const [markersKey, setMarkersKey] = useState(0); // Add a key to force marker re-creation
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useTheme();
  
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
      } catch (error) {
        console.warn('Using default location:', DEFAULT_LOCATION);
      }

      // Initialize map with theme-based style
      const themeStyle = isDarkMode ? MAP_STYLES.dark : MAP_STYLES.light;
      map.current = new mapboxgl.Map({
        container: containerElement,
        style: themeStyle[mapStyle],
        center: initialCenter,
        zoom: DEFAULT_ZOOM
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add user location control (the pip) - we'll manually trigger it after checking permissions
      geolocateControl.current = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: true
      });
      
      map.current.addControl(geolocateControl.current, 'top-right');

      // Wait for map to fully load before setting initialized state
      map.current.on('load', () => {
        addRouteLayer();
        setIsMapInitialized(true);
        setMarkersKey(prev => prev + 1);
        
        // Check if we already have geolocation permission from a previous session
        const hasGeolocationPermission = localStorage.getItem('hasGeolocationPermission');
        
        // Only trigger after a delay if we have permission, to avoid re-prompting
        if (hasGeolocationPermission === 'true') {
          setTimeout(() => {
            geolocateControl.current?.trigger();
          }, 1000);
        }
        
        // Listen for the geolocate event to track permissions
        if (geolocateControl.current) {
          geolocateControl.current.on('geolocate', () => {
            // Store that permission was granted
            localStorage.setItem('hasGeolocationPermission', 'true');
          });
          
          geolocateControl.current.on('error', () => {
            // Permission might have been denied
            localStorage.setItem('hasGeolocationPermission', 'false');
          });
        }
      });

      // Add click handler for adding locations
      map.current.on('click', (e) => {
        const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        const name = prompt('Enter location name:');
        if (name) {
          const newLocation: Location = {
            id: uuidv4(),
            name,
            coordinates,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setLocations(prev => [...prev, newLocation]);
        }
      });
    };

    initMap();

    // Cleanup on unmount
    return () => {
      map.current?.remove();
      setIsMapInitialized(false);
    };
  }, [isDarkMode]); // Re-initialize map when dark mode changes

  // Handle map style changes separately
  useEffect(() => {
    if (!map.current || !isMapInitialized) return;

    // Get the theme-appropriate style
    const themeStyle = isDarkMode ? MAP_STYLES.dark : MAP_STYLES.light;
    const newStyleUrl = themeStyle[mapStyle];

    // Don't run on initial render when mapStyle is just initialized
    try {
      const currentStyle = map.current.getStyle();
      if (currentStyle && currentStyle.name === newStyleUrl) return;
    } catch (e) {
      // Style might not be available yet
      return;
    }
    
    const currentCenter = map.current.getCenter();
    const currentZoom = map.current.getZoom();

    // Simple approach - just set the style and restore view after a brief delay
    map.current.setStyle(newStyleUrl);
    
    // Let the styledata event in LocationMarker handle marker re-creation
    setTimeout(() => {
      if (map.current) {
        map.current.setCenter(currentCenter);
        map.current.setZoom(currentZoom);
        addRouteLayer();
        
        // Re-trigger location after style change
        setTimeout(() => {
          geolocateControl.current?.trigger();
        }, 200);
      }
    }, 150);
    
  }, [mapStyle, isMapInitialized, isDarkMode]);

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
          'line-color': '#4264fb',
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

  const handleRouteSelect = async (start: Location, end: Location) => {
    if (!map.current) return;

    try {
      // Get route from Mapbox Directions API
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start.coordinates[0]},${start.coordinates[1]};${end.coordinates[0]},${end.coordinates[1]}?geometries=geojson&overview=full&steps=true&access_token=${mapboxgl.accessToken}`
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
          new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
        );

        map.current.fitBounds(bounds, {
          padding: 50,
          duration: 1000
        });

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

  return (
    <div className={`${styles.wrapper} ${isDarkMode ? 'dark' : ''}`}>
      <div className={styles.mapWrapper}>
        <div ref={mapContainer} className={styles.mapContainer} />
        <div className={`${styles.uiContainer} dark:bg-gray-800 dark:text-white`}>
          <div className={styles.toggleContainer}>
            <DarkModeToggle />
          </div>
          <div className="flex flex-col gap-2">
            <button
              className={`${styles.styleButton} dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600`}
              onClick={() => handleLayerChange('map')}
            >
              {mapStyle === 'map' ? '🗺️ Map' : 'Map'}
            </button>
            <button
              className={`${styles.styleButton} dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600`}
              onClick={() => handleLayerChange('satellite')}
            >
              {mapStyle === 'satellite' ? '🛰️ Satellite' : 'Satellite'}
            </button>
          </div>
        </div>
      </div>
      
      {isMapInitialized && locations.map((location) => (
        <LocationMarker
          key={`${location.id}-${markersKey}`}
          map={map.current!}
          location={location}
          onClick={() => handleLocationSelect(location)}
        />
      ))}
      
      <div 
        className={`${styles.panel} ${activePanel === 'none' ? styles.hidden : ''} dark:bg-gray-800 dark:text-white`}
      >
        {activePanel === 'locations' ? (
          <LocationList 
            locations={locations} 
            onLocationSelect={handleLocationSelect}
            onLocationDelete={handleLocationDelete}
          />
        ) : activePanel === 'directions' ? (
          <DirectionsPanel 
            locations={locations}
            onRouteSelect={handleRouteSelect}
          />
        ) : null}
      </div>
      
      <div className={`${styles.actionBar} dark:bg-gray-900 dark:border-t dark:border-gray-700`}>
        <button
          className={`${styles.actionButton} ${activePanel === 'locations' ? styles.active : ''} dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white`}
          onClick={() => togglePanel('locations')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          Locations
        </button>
        <button
          className={`${styles.actionButton} ${activePanel === 'directions' ? styles.active : ''} dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white`}
          onClick={() => togglePanel('directions')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
          </svg>
          Directions
        </button>
      </div>
    </div>
  );
}; 