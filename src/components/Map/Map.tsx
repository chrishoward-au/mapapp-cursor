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

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapStyle, setMapStyle] = useState<UserPreferences['defaultMapLayer']>('map');
  const [isMapInitialized, setIsMapInitialized] = useState(false);
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

  const handleRouteSelect = (start: Location, end: Location) => {
    // TODO: Implement route calculation in next version
    console.log('Calculating route from', start.name, 'to', end.name);
  };

  return (
    <div className={styles.wrapper}>
      <div ref={mapContainer} className={styles.mapContainer} />
      <div className={styles.uiContainer}>
        <div className={styles.controls}>
          <div className={styles.layerToggle}>
            <LayerToggle onLayerChange={handleLayerChange} />
          </div>
          <TabPanel
            tabs={[
              {
                id: 'locations',
                label: 'Locations',
                content: (
                  <LocationList
                    locations={locations}
                    onLocationSelect={handleLocationSelect}
                    onLocationDelete={handleLocationDelete}
                  />
                )
              },
              {
                id: 'directions',
                label: 'Directions',
                content: (
                  <DirectionsPanel
                    locations={locations}
                    onRouteSelect={handleRouteSelect}
                  />
                )
              }
            ]}
          />
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
  );
}; 