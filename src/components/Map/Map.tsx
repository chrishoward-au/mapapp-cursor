import { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './Map.module.css';
import { LocationMarker } from './LocationMarker';
import { LocationList } from './LocationList';
import { DirectionsPanel } from './Directions/DirectionsPanel';
import { AddLocationModal } from './AddLocationModal';
import { RouteManager } from './Routes/RouteManager';
import { ActionBar } from './Controls/ActionBar';
import { MapControls } from './Controls/MapControls';
import { useMapContext } from '../../contexts/MapContext';
import { initializeMap, setupRouteLayer, DEFAULT_LOCATION, MAP_STYLES } from '../../services/mapService';

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

  // Initialize map on component mount
  useEffect(() => {
    const containerElement = mapContainer.current;
    if (!containerElement) return;

    const initMap = async () => {
      // Try to get user location, default to Melbourne if not available
      let initialCenter: [number, number] = DEFAULT_LOCATION;
      try {
        initialCenter = await getUserLocation();
        console.info('Using user location:', initialCenter);
      } catch (error) {
        console.info('Using default location (Melbourne):', DEFAULT_LOCATION);
      }

      // Create and initialize the map
      const newMap = initializeMap(
        containerElement,
        initialCenter,
        12,
        MAP_STYLES[mapStyle]
      );

      // Store map reference in context
      setMap(newMap);

      // Set up route layer and map event handlers when the map loads
      newMap.on('load', () => {
        setupRouteLayer(newMap, routeDirectionType);
        setIsMapInitialized(true);
        
        // Trigger the geolocation control after map loads
        setTimeout(() => {
          // Find the geolocate control using more direct approach
          const geolocateControl = document.querySelector('.mapboxgl-ctrl-geolocate');
          if (geolocateControl) {
            (geolocateControl as HTMLElement).click();
          }
        }, 1000);
      });

      // Add click handler to open the add location modal
      newMap.on('click', (e) => {
        const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        openAddLocationModal(coordinates);
      });
    };

    initMap();

    // Cleanup on unmount
    return () => {
      if (map) {
        map.remove();
        setMap(null as any); // TypeScript fix
        setIsMapInitialized(false);
      }
    };
  }, []); // Only run on mount

  // Handle map resize when panel state changes
  useEffect(() => {
    if (!map || !isMapInitialized) return;
    
    // Resize map when panel state changes
    map.resize();
    
    // Additional resize after animation completes
    const resizeTimer = setTimeout(() => {
      if (map) {
        map.resize();
      }
    }, 350);
    
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
        <div ref={mapContainer} className={styles.mapContainer} />
        
        {/* Render location markers when map is ready */}
        {isMapInitialized && map && (
          <>
            {locations.map(location => (
              <LocationMarker
                key={location.id}
                map={map}
                location={location}
                onClick={selectLocation}
              />
            ))}
          </>
        )}
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
      <MapControls />
      
      {/* Route Manager - only render when route is active */}
      {routeStartLocation && routeEndLocation && map && (
        <RouteManager />
      )}
    </div>
  );
};