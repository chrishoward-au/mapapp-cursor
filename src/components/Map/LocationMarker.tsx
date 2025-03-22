import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Location } from '../../types';

interface LocationMarkerProps {
  map: mapboxgl.Map | null;
  location: Location;
  onClick?: (location: Location) => void;
}

export const LocationMarker = ({ map, location, onClick }: LocationMarkerProps) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  
  console.log('MARKER RENDER:', location.name, 'map:', !!map);

  useEffect(() => {
    console.log('MARKER EFFECT: Creating marker for', location.name);
    if (!map) {
      console.log('MARKER ERROR: Map not provided');
      return;
    }

    const addMarker = () => {
      console.log('MARKER ADD: Creating marker for', location.name);
      if (markerRef.current) {
        console.log('MARKER CLEANUP: Removing existing marker for', location.name);
        markerRef.current.remove();
      }

      // Create marker element
      const el = document.createElement('div');
      el.className = 'location-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0MjY0ZmIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTBjMCA3LTkgMTMtOSAxM3MtOS02LTktMTNhOSA5IDAgMCAxIDE4IDB6Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIvPjwvc3ZnPg==)';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';

      // Create and add the marker
      console.log('MARKER ADD: Adding marker to map for', location.name, 'at', location.coordinates);
      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat(location.coordinates)
        .addTo(map);

      // Add click handler if provided
      if (onClick) {
        console.log('MARKER ADD: Adding click listener for', location.name);
        el.addEventListener('click', () => onClick(location));
      }
      
      console.log('MARKER ADD: Marker added successfully for', location.name);
    };

    // Add marker when map is loaded
    console.log('MARKER MAP: Checking map.loaded():', map.loaded());
    
    // Always add marker immediately - don't wait for load event
    // This fixes the issue with markers not appearing
    addMarker();

    // Handle style changes
    const handleStyleData = () => {
      console.log('MARKER STYLE: Style changed, re-adding marker for', location.name);
      // Short delay to ensure map is ready after style change
      setTimeout(() => {
        addMarker();
      }, 100);
    };
    
    console.log('MARKER LISTEN: Adding styledata event listener for', location.name);
    map.on('styledata', handleStyleData);

    // Cleanup
    return () => {
      console.log('MARKER CLEANUP: Component unmounting, cleaning up marker for', location.name);
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      map.off('styledata', handleStyleData);
    };
  }, [map, location, onClick]);

  return null;
}; 