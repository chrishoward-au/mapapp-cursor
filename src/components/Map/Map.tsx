import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './Map.module.css';
import { LocationMarker } from './LocationMarker';
import { LocationList } from './LocationList';
import { DirectionsPanel } from './Directions/DirectionsPanel';
import { Location, UserPreferences } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '../../services/storage';

// Initialize Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MAP_STYLES = {
  map: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
};

const ROUTE_SOURCE_ID = 'route';
const ROUTE_LAYER_ID = 'route-line';
const DEFAULT_LOCATION: [number, number] = [144.9631, -37.8136]; // Melbourne, Australia [lng, lat]
const DEFAULT_ZOOM = 10;

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [activePanel, setActivePanel] = useState<'none' | 'locations' | 'directions'>('none');
  const [locations, setLocations] = useState<Location[]>([]);
  const [mapStyle, setMapStyle] = useState<UserPreferences['defaultMapLayer']>('map');
  const [markersKey, setMarkersKey] = useState(0); // Add a key to force marker re-creation
  const [isLoading, setIsLoading] = useState(true);
  
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

      // Initialize map
      map.current = new mapboxgl.Map({
        container: containerElement,
        style: MAP_STYLES[mapStyle],
        center: initialCenter,
        zoom: DEFAULT_ZOOM
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Wait for map to fully load before setting initialized state
      map.current.on('load', () => {
        addRouteLayer();
        setIsMapInitialized(true);
        setMarkersKey(prev => prev + 1);
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
  }, []); // Only run once on mount

  // Handle map style changes separately
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
    
  }, [mapStyle, isMapInitialized]);

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
          new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
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
    <div className={styles.wrapper}>
      <div className={styles.mapWrapper}>
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
          />
        )}
        {activePanel === 'directions' && (
          <DirectionsPanel
            locations={locations}
            onRouteSelect={handleRouteSelect}
          />
        )}
      </div>

      <div className={styles.actionBar}>
        <button
          className={`${styles.actionButton} ${activePanel === 'locations' ? styles.active : ''}`}
          onClick={() => togglePanel('locations')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </button>
        <button
          className={`${styles.actionButton} ${activePanel === 'directions' ? styles.active : ''}`}
          onClick={() => togglePanel('directions')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
        
        <button
          className={`${styles.actionButton}`}
          onClick={() => handleLayerChange(mapStyle === 'map' ? 'satellite' : 'map')}
          title={mapStyle === 'map' ? 'Switch to satellite view' : 'Switch to map view'}
        >
          {mapStyle === 'map' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
              <line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}; 