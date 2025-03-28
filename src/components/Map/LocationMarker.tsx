import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { Location } from '../../types';

interface LocationMarkerProps {
  map: mapboxgl.Map;
  location: Location;
  onClick?: (location: Location) => void;
}

export const LocationMarker = ({ map, location, onClick }: LocationMarkerProps) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Create marker function - extracted to avoid duplication
  const createMarker = useCallback(() => {
    try {
      // Make sure the map is valid and loaded before working with it
      if (!map || !map.getContainer()) return;
    
      // Remove previous marker if it exists
      if (markerRef.current) {
        markerRef.current.remove();
      }
  
      // Create new marker
      const marker = new mapboxgl.Marker({ 
        color: '#4264fb',
        scale: 0.7 // Make markers smaller (default is 1)
      })
        .setLngLat(location.coordinates);
      
      // Only add to map if the map is ready
      if (map.loaded()) {
        marker.addTo(map);
      } else {
        // If map isn't ready, wait for it to load
        map.once('load', () => marker.addTo(map));
      }
  
      // Add click handler if onClick is provided
      if (onClick) {
        const el = marker.getElement();
        el.addEventListener('click', () => {
          onClick(location);
        });
      }
  
      // Store marker reference
      markerRef.current = marker;
    } catch (error) {
      console.warn('Error creating marker:', error);
    }
  }, [map, location, onClick]);

  // Initialize marker when component mounts
  useEffect(() => {
    createMarker();

    // Re-create marker when map style changes
    const handleStyleChange = () => {
      createMarker();
    };

    // Only attach event if map is valid
    if (map && map.getContainer()) {
      map.on('styledata', handleStyleChange);
    }

    // Cleanup on unmount
    return () => {
      try {
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        if (map && map.getContainer()) {
          map.off('styledata', handleStyleChange);
        }
      } catch (error) {
        console.warn('Error during marker cleanup:', error);
      }
    };
  }, [map, location, onClick, createMarker]);

  // This component doesn't render anything visible
  return null;
};