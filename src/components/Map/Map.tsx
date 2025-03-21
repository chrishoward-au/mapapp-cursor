import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './Map.module.css';
import { LayerToggle } from './LayerToggle';
import { LocationMarker } from './LocationMarker';
import { LocationList } from './LocationList';
import { DirectionsPanel } from './Directions/DirectionsPanel';
import { TabPanel } from './TabPanel/TabPanel';
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
  const [mapStyle, setMapStyle] = useState<UserPreferences['defaultMapLayer']>('map');
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [activePanel, setActivePanel] = useState<'none' | 'locations' | 'directions'>('none');
  const [locations, setLocations] = useState<Location[]>(() => {
    // Initialize locations from storage on component mount
    return storageService.getLocations();
  });

  // Initialize map and handle location persistence
  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[mapStyle],
      center: [-74.5, 40],
      zoom: 9
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Wait for map to load before setting initialized state
    map.current.on('load', () => {
      setIsMapInitialized(true);

      // Add route source and layer
      map.current?.addSource(ROUTE_SOURCE_ID, {
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

      map.current?.addLayer({
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

    // Cleanup on unmount
    return () => {
      map.current?.remove();
      setIsMapInitialized(false);
    };
  }, [mapStyle]);

  // Save locations whenever they change
  useEffect(() => {
    if (locations.length > 0 || storageService.getLocations().length > 0) {
      storageService.saveLocations(locations);
    }
  }, [locations]);

  const handleLayerChange = (layer: UserPreferences['defaultMapLayer']) => {
    setMapStyle(layer);
    if (map.current) {
      map.current.setStyle(MAP_STYLES[layer]);
    }
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
        <div className={styles.mapUI}>
          <div className={styles.layerToggle}>
            <LayerToggle onLayerChange={handleLayerChange} />
          </div>
          {isMapInitialized && locations.map(location => (
            <LocationMarker
              key={location.id}
              map={map.current}
              location={location}
              onClick={handleLocationSelect}
            />
          ))}
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Locations
        </button>
        <button
          className={`${styles.actionButton} ${activePanel === 'directions' ? styles.active : ''}`}
          onClick={() => togglePanel('directions')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Directions
        </button>
      </div>
    </div>
  );
}; 