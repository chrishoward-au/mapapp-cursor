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
    // Remove previous marker if it exists
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create new marker
    const marker = new mapboxgl.Marker({ 
      color: '#4264fb',
      scale: 0.7 // Make markers smaller (default is 1)
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    // Add click handler if onClick is provided
    if (onClick) {
      const el = marker.getElement();
      el.addEventListener('click', () => {
        onClick(location);
      });
    }

    // Store marker reference
    markerRef.current = marker;
  }, [map, location, onClick]);

  // Initialize marker when component mounts
  useEffect(() => {
    createMarker();

    // Re-create marker when map style changes
    const handleStyleChange = () => {
      createMarker();
    };

    map.on('styledata', handleStyleChange);

    // Cleanup on unmount
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      map.off('styledata', handleStyleChange);
    };
  }, [map, location, onClick, createMarker]);

  // This component doesn't render anything visible
  return null;
};