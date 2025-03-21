import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './Map.module.css';
import { LayerToggle } from './LayerToggle';
import { LocationMarker } from './LocationMarker';
import { LocationList } from './LocationList';
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
  const [locations, setLocations] = useState<Location[]>([]);

  // Load saved locations on mount
  useEffect(() => {
    const savedLocations = storageService.getLocations();
    setLocations(savedLocations);
  }, []);

  // Save locations whenever they change
  useEffect(() => {
    storageService.saveLocations(locations);
  }, [locations]);

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
    };
  }, []);

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

  return (
    <div ref={mapContainer} className={styles.mapContainer}>
      <LayerToggle onLayerChange={handleLayerChange} />
      <LocationList
        locations={locations}
        onLocationSelect={handleLocationSelect}
        onLocationDelete={handleLocationDelete}
      />
      {map.current && locations.map(location => (
        <LocationMarker
          key={location.id}
          map={map.current}
          location={location}
          onClick={handleLocationSelect}
        />
      ))}
    </div>
  );
}; 