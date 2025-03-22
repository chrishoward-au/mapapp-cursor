import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './Map.module.css';
import { LayerToggle } from './LayerToggle';
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

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [activePanel, setActivePanel] = useState<'none' | 'locations' | 'directions'>('none');
  const [locations, setLocations] = useState<Location[]>(() => {
    // Initialize locations from storage on component mount
    const storedLocations = storageService.getLocations();
    console.log('INIT: Loading locations from storage:', storedLocations);
    return storedLocations;
  });
  const [mapStyle, setMapStyle] = useState<UserPreferences['defaultMapLayer']>('map');
  const [markersKey, setMarkersKey] = useState(0); // Add a key to force marker re-creation

  console.log('RENDER: Map component rendering, isMapInitialized:', isMapInitialized, 'markersKey:', markersKey, 'locations:', locations);

  // Initialize map
  useEffect(() => {
    console.log('EFFECT: Map initialization starting');
    if (!mapContainer.current) {
      console.log('ERROR: Map container not found');
      return;
    }

    // Initialize map
    console.log('MAP: Creating new map instance with style:', MAP_STYLES[mapStyle]);
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[mapStyle],
      center: [-74.5, 40],
      zoom: 9
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Wait for map to fully load before setting initialized state
    map.current.on('load', () => {
      console.log('MAP LOAD: Map fully loaded');
      addRouteLayer();
      console.log('MAP LOAD: Setting isMapInitialized to true');
      setIsMapInitialized(true);
      console.log('MAP LOAD: Incrementing markersKey from', markersKey);
      setMarkersKey(prev => {
        console.log('MAP LOAD: New markersKey will be', prev + 1);
        return prev + 1;
      });
    });

    // Add click handler for adding locations
    map.current.on('click', (e) => {
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const name = prompt('Enter location name:');
      if (name) {
        console.log('MAP CLICK: Adding new location:', name, coordinates);
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

    // Cleanup on unmount
    return () => {
      console.log('CLEANUP: Removing map');
      map.current?.remove();
      setIsMapInitialized(false);
    };
  }, []); // Only run once on mount

  // Handle map style changes separately
  useEffect(() => {
    console.log('EFFECT: Style change effect running, mapStyle:', mapStyle, 'isMapInitialized:', isMapInitialized);
    
    if (!map.current) {
      console.log('STYLE: map.current is null, skipping style change');
      return;
    }
    
    // Skip initial render and style changes when map is not initialized
    if (!isMapInitialized) {
      console.log('STYLE: Map not initialized yet, skipping style change');
      return;
    }

    // Don't run on initial render when mapStyle is just initialized
    try {
      const currentStyle = map.current.getStyle();
      console.log('STYLE: Current style:', currentStyle?.name, 'New style:', MAP_STYLES[mapStyle]);
      
      if (currentStyle && currentStyle.name === MAP_STYLES[mapStyle]) {
        console.log('STYLE: Style unchanged, skipping update');
        return;
      }
    } catch (e) {
      // Style might not be available yet
      console.log('STYLE ERROR: Style not available yet', e);
      return;
    }

    console.log('STYLE: Changing style to:', mapStyle);
    
    const currentCenter = map.current.getCenter();
    const currentZoom = map.current.getZoom();
    console.log('STYLE: Saving view state, center:', currentCenter, 'zoom:', currentZoom);

    // Simple approach - just set the style and restore view after a brief delay
    map.current.setStyle(MAP_STYLES[mapStyle]);
    
    // Let the styledata event in LocationMarker handle marker re-creation
    setTimeout(() => {
      if (map.current) {
        console.log('STYLE: Restoring view state after style change');
        map.current.setCenter(currentCenter);
        map.current.setZoom(currentZoom);
        addRouteLayer();
      }
    }, 150);
    
  }, [mapStyle, isMapInitialized]);

  // Save locations whenever they change
  useEffect(() => {
    console.log('EFFECT: Locations changed, new locations:', locations);
    if (locations.length > 0 || storageService.getLocations().length > 0) {
      console.log('STORAGE: Saving locations to storage');
      storageService.saveLocations(locations);
    }
  }, [locations]);

  const addRouteLayer = () => {
    console.log('ROUTE: Adding/updating route layer');
    if (!map.current) {
      console.log('ROUTE ERROR: map.current is null');
      return;
    }

    // Check if source already exists and remove it
    if (map.current.getSource(ROUTE_SOURCE_ID)) {
      console.log('ROUTE: Removing existing route source/layer');
      if (map.current.getLayer(ROUTE_LAYER_ID)) {
        map.current.removeLayer(ROUTE_LAYER_ID);
      }
      map.current.removeSource(ROUTE_SOURCE_ID);
    }

    // Add route source and layer
    console.log('ROUTE: Adding new route source/layer');
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
      console.log('ROUTE: Route layer added successfully');
    } catch (e) {
      console.error('ROUTE ERROR: Failed to add route layer', e);
    }
  };

  const handleLayerChange = (layer: UserPreferences['defaultMapLayer']) => {
    console.log('ACTION: Layer change requested to', layer);
    if (!map.current) {
      console.log('ACTION ERROR: map.current is null');
      return;
    }
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
                map={map.current}
                location={location}
                onClick={handleLocationSelect}
              />
            ))}
          </div>
        )}
        <div className={styles.mapUI}>
          <div className={styles.layerToggle}>
            <LayerToggle onLayerChange={handleLayerChange} />
          </div>
        </div>
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
      </div>
    </div>
  );
}; 