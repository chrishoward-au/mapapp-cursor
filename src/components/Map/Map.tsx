import { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './Map.module.css';
import { LocationMarker } from './LocationMarker';
import { LocationList } from './LocationList';
import { DirectionsPanel } from './Directions/DirectionsPanel';
import { AddLocationModal } from './AddLocationModal';
import { RouteManager } from './Routes/RouteManager';
import { ActionBar } from './Controls/ActionBar';
import { useMapContext } from '../../contexts/MapContext';
import mapboxgl from 'mapbox-gl';
import { setupRouteLayer, DEFAULT_LOCATION, MAP_STYLES } from '../../services/mapService';

export const Map = () => {
  // Get shared state and methods from context
  const {
    // Map state
    map,
    setMap,
    isMapInitialized,
    setIsMapInitialized,
    mapStyle,
    
    // Panel state
    activePanel,
    
    // Location state
    locations,
    
    // Modal state
    isAddLocationModalOpen,
    newLocationCoordinates,
    openAddLocationModal,
    closeAddLocationModal,
    addLocation,
    
    // Route state
    routeStartLocation,
    routeEndLocation,
    routeDirectionType,
    
    // Methods
    selectLocation,
    getUserLocation
  } = useMapContext();
  
  // Reference to the map container element
  const mapContainer = useRef<HTMLDivElement>(null);
  
  // Prevent double-initialization
  const mapInitializedRef = useRef(false);

  // Initialize map only once on mount
  useEffect(() => {
    // Skip if already initialized or container not ready
    if (mapInitializedRef.current || !mapContainer.current || map) return;
    
    // Mark as initialized immediately to prevent double init
    mapInitializedRef.current = true;
    
    const initMap = async () => {
      try {
        // Get user location or use default
        let initialCenter: [number, number] = DEFAULT_LOCATION;
        try {
          initialCenter = await getUserLocation();
        } catch (error) {
          console.info('Using default location:', DEFAULT_LOCATION);
        }
        
        // Create new map with minimal config
        const newMap = new mapboxgl.Map({
          container: mapContainer.current!,
          style: `mapbox://styles/mapbox/${MAP_STYLES[mapStyle]}`,
          center: initialCenter,
          zoom: 12
        });
        
        // Add controls
        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
        newMap.addControl(new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
            timeout: 6000
          },
          trackUserLocation: true,
          showUserHeading: true,
          showAccuracyCircle: true
        }), 'top-right');
        
        // Store in context
        setMap(newMap);
        
        // Initialize when loaded
        newMap.on('load', () => {
          setupRouteLayer(newMap, routeDirectionType);
          setIsMapInitialized(true);
        });
        
        // Click handler for adding locations
        newMap.on('click', (e) => {
          const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
          openAddLocationModal(coordinates);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        mapInitializedRef.current = false; // Reset so we can try again
      }
    };
    
    initMap();
    
    // Cleanup on unmount
    return () => {
      if (map) {
        // Cast to any to avoid TypeScript errors
        (map as any).remove();
        setMap(null as any);
        setIsMapInitialized(false);
      }
    };
  }, [map, mapStyle, getUserLocation, openAddLocationModal, routeDirectionType, setIsMapInitialized, setMap]);
  
  // Handle map resize when panel state changes
  useEffect(() => {
    if (!map || !isMapInitialized) return;
    
    // Use a timer to handle resize after panel animation completes
    const resizeTimer = setTimeout(() => {
      map.resize();
    }, 300); // Should match the panel transition time
    
    return () => clearTimeout(resizeTimer);
  }, [activePanel, isMapInitialized, map]);

  // Handle saving a location from the modal
  const handleSaveLocation = (name: string) => {
    if (newLocationCoordinates) {
      addLocation(name, newLocationCoordinates);
      closeAddLocationModal();
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.mapWrapper} ${activePanel !== 'none' ? styles.withPanel : ''}`}>
        {/* Map container - kept deliberately simple */}
        <div ref={mapContainer} className={styles.mapContainer} />
      </div>

      {/* Side panel */}
      <div className={`${styles.panel} ${activePanel === 'none' ? styles.hidden : ''}`}>
        {activePanel === 'locations' && (
          <LocationList />
        )}
        {activePanel === 'directions' && (
          <DirectionsPanel />
        )}
      </div>

      {/* Add location modal */}
      <AddLocationModal
        isOpen={isAddLocationModalOpen}
        coordinates={newLocationCoordinates}
        onSave={handleSaveLocation}
        onCancel={closeAddLocationModal}
      />
      
      {/* Controls */}
      <ActionBar />
      
      {/* Location markers */}
      {isMapInitialized && map && locations.map(location => (
        <LocationMarker
          key={location.id}
          map={map}
          location={location}
          onClick={selectLocation}
        />
      ))}
      
      {/* Route Manager - only render when route is active */}
      {routeStartLocation && routeEndLocation && map && (
        <RouteManager />
      )}
    </div>
  );
};