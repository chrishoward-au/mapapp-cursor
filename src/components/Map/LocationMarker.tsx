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
      // Exit early if map isn't available
      if (!map) return;
      
      // Wait until next tick - this ensures the DOM is ready
      setTimeout(() => {
        try {
          // Double-check map validity after timeout
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
          
          // Add to map with a safety check
          const addMarkerToMap = () => {
            if (map && marker) {
              try {
                marker.addTo(map);
              } catch (e) {
                console.warn('Error adding marker to map:', e);
              }
            }
          };
          
          // Wait for map to be ready
          if (map.loaded()) {
            addMarkerToMap();
          } else {
            map.once('load', addMarkerToMap);
          }
      
          // Add click handler if onClick is provided
          if (onClick) {
            const el = marker.getElement();
            if (el) {
              el.addEventListener('click', () => {
                onClick(location);
              });
              
              // Make element receive pointer events
              el.style.pointerEvents = 'auto';
            }
          }
      
          // Store marker reference
          markerRef.current = marker;
        } catch (err) {
          console.warn('Error in marker creation timeout:', err);
        }
      }, 0);
    } catch (error) {
      console.warn('Error in marker creation:', error);
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