import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Location } from '../../../types';
import { storageService } from '../../../services/storage';

interface LocationManagerProps {
  map: mapboxgl.Map | null;
  locations: Location[];
  onLocationsChange: (locations: Location[]) => void;
  onLocationSelect: (location: Location) => void;
}

export const LocationManager: React.FC<LocationManagerProps> = ({
  map,
  locations,
  onLocationsChange,
  onLocationSelect
}) => {
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

  // Create and update map markers when locations change
  useEffect(() => {
    if (!map) return;
    
    // Remove existing markers
    markers.forEach(marker => marker.remove());
    
    // Add markers for each location
    const newMarkers = locations.map(location => {
      const marker = new mapboxgl.Marker({ color: '#3b82f6' })
        .setLngLat(location.coordinates)
        .addTo(map);
      
      // Add click handler to marker
      const markerElement = marker.getElement();
      markerElement.addEventListener('click', () => onLocationSelect(location));
      
      return marker;
    });
    
    setMarkers(newMarkers);
    
    return () => {
      newMarkers.forEach(marker => marker.remove());
    };
  }, [map, locations, onLocationSelect]);

  // Load locations from storage on component mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const storedLocations = await storageService.getLocations();
        if (storedLocations.length > 0) {
          onLocationsChange(storedLocations);
        }
      } catch (error) {
        console.error('Failed to load locations:', error);
      }
    };
    
    loadLocations();
  }, [onLocationsChange]);

  // Save locations when they change
  useEffect(() => {
    const saveLocations = async () => {
      try {
        await storageService.saveLocations(locations);
      } catch (error) {
        console.error('Failed to save locations:', error);
      }
    };
    
    saveLocations();
  }, [locations]);

  return null; // This is a logic-only component
}; 