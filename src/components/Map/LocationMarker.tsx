import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Location } from '../../types';

interface LocationMarkerProps {
  map: mapboxgl.Map;
  location: Location;
  onClick?: (location: Location) => void;
}

export const LocationMarker = ({ map, location, onClick }: LocationMarkerProps) => {
  // Keep reference to marker for cleanup
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Create and manage marker lifecycle
  useEffect(() => {
    if (!map) return;
    
    // Create marker
    const marker = new mapboxgl.Marker({ 
      color: '#4264fb',
      scale: 0.7 // Make markers smaller (default is 1)
    })
      .setLngLat(location.coordinates)
      .addTo(map);
    
    // Add click handler
    if (onClick) {
      const el = marker.getElement();
      el.addEventListener('click', () => {
        onClick(location);
      });
    }
    
    // Store reference
    markerRef.current = marker;
    
    // Cleanup on unmount or when props change
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [map, location, onClick]);

  // This component doesn't render anything visible
  return null;
};