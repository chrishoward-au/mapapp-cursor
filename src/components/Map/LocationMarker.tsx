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
    // Create marker element
    const el = document.createElement('div');
    el.className = 'location-marker';
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0MjY0ZmIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTBjMCA3LTkgMTMtOSAxM3MtOS02LTktMTNhOSA5IDAgMCAxIDE4IDB6Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIvPjwvc3ZnPg==)';
    el.style.backgroundSize = 'cover';
    el.style.cursor = 'pointer';

    // Create and add the marker
    markerRef.current = new mapboxgl.Marker(el)
      .setLngLat(location.coordinates)
      .addTo(map);

    // Add click handler if provided
    if (onClick) {
      el.addEventListener('click', () => onClick(location));
    }

    // Cleanup
    return () => {
      markerRef.current?.remove();
    };
  }, [map, location, onClick]);

  return null;
}; 