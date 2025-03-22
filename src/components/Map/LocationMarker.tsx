import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Location } from '../../types';

interface LocationMarkerProps {
  map: mapboxgl.Map;
  location: Location;
  onClick?: (location: Location) => void;
}

export const LocationMarker = ({ map, location, onClick }: LocationMarkerProps) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    // Create marker when component mounts
    const addMarker = () => {
      // Remove previous marker if it exists (avoid duplicates)
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Create and add the marker
      const marker = new mapboxgl.Marker({ color: '#4264fb' })
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
    };

    // Add marker initially
    addMarker();

    // Re-add marker when map style changes
    const handleStyleChange = () => {
      addMarker();
    };

    map.on('styledata', handleStyleChange);

    // Cleanup on unmount
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      map.off('styledata', handleStyleChange);
    };
  }, [map, location, onClick]);

  return null;
}; 