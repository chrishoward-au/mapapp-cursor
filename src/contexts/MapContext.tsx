import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { v4 as uuidv4 } from 'uuid';
import { Location } from '../types';
import { DirectionType } from '../components/Map/Directions/DirectionsPanel';
import { storageService } from '../services/storage';
import { RouteInfo } from '../components/Map/Routes/RouteManager';

export type PanelType = 'none' | 'locations' | 'directions';
export type MapStyleType = 'map' | 'satellite';

interface MapContextType {
  // Map state
  map: mapboxgl.Map | null;
  isMapInitialized: boolean;
  setMap: (map: mapboxgl.Map) => void;
  setIsMapInitialized: (initialized: boolean) => void;
  mapStyle: MapStyleType;
  setMapStyle: (style: MapStyleType) => void;
  
  // Panel state
  activePanel: PanelType;
  togglePanel: (panel: 'locations' | 'directions') => void;
  
  // Location state
  locations: Location[];
  isLoading: boolean;
  addLocation: (name: string, coordinates: [number, number]) => void;
  deleteLocation: (locationId: string) => void;
  selectLocation: (location: Location) => void;
  
  // Modal state
  isAddLocationModalOpen: boolean;
  newLocationCoordinates: [number, number] | null;
  openAddLocationModal: (coordinates: [number, number]) => void;
  closeAddLocationModal: () => void;
  
  // Route state
  routeStartLocation: Location | null;
  routeEndLocation: Location | null;
  routeDirectionType: DirectionType;
  routeInfo: RouteInfo | null;
  setRouteStartLocation: (location: Location | null) => void;
  setRouteEndLocation: (location: Location | null) => void;
  setRouteDirectionType: (type: DirectionType) => void;
  updateRouteInfo: (info: RouteInfo) => void;
  
  // Map utilities
  fitToAllLocations: () => void;
  getUserLocation: () => Promise<[number, number]>;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};

interface MapProviderProps {
  children: ReactNode;
}

export const MapProvider = ({ children }: MapProviderProps) => {
  // Map state
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyleType>('map');
  
  // Panel state
  const [activePanel, setActivePanel] = useState<PanelType>('none');
  
  // Location state
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [newLocationCoordinates, setNewLocationCoordinates] = useState<[number, number] | null>(null);
  
  // Route state
  const [routeStartLocation, setRouteStartLocation] = useState<Location | null>(null);
  const [routeEndLocation, setRouteEndLocation] = useState<Location | null>(null);
  const [routeDirectionType, setRouteDirectionType] = useState<DirectionType>('walking');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  
  // Load locations from storage on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setIsLoading(true);
        const storedLocations = await storageService.getLocations();
        setLocations(storedLocations);
      } catch (error) {
        console.error('Failed to load locations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLocations();
  }, []);
  
  // Save locations whenever they change
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load
    
    const saveLocationsToStorage = async () => {
      try {
        await storageService.saveLocations(locations);
      } catch (error) {
        console.error('Failed to save locations:', error);
      }
    };
    
    saveLocationsToStorage();
  }, [locations, isLoading]);
  
  // Panel toggle handler
  const togglePanel = useCallback((panel: 'locations' | 'directions') => {
    setActivePanel(current => current === panel ? 'none' : panel);
  }, []);
  
  // Location handlers
  const addLocation = useCallback((name: string, coordinates: [number, number]) => {
    const newLocation: Location = {
      id: uuidv4(),
      name,
      coordinates,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLocations(prev => [...prev, newLocation]);
  }, []);
  
  const deleteLocation = useCallback((locationId: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== locationId));
  }, []);
  
  const selectLocation = useCallback((location: Location) => {
    if (map) {
      map.flyTo({
        center: location.coordinates,
        zoom: 14
      });
    }
  }, [map]);
  
  // Modal handlers
  const openAddLocationModal = useCallback((coordinates: [number, number]) => {
    setNewLocationCoordinates(coordinates);
    setIsAddLocationModalOpen(true);
  }, []);
  
  const closeAddLocationModal = useCallback(() => {
    setIsAddLocationModalOpen(false);
    setNewLocationCoordinates(null);
  }, []);
  
  // Route handlers
  const updateRouteInfo = useCallback((info: RouteInfo) => {
    setRouteInfo(info);
  }, []);
  
  // Map utilities
  const fitToAllLocations = useCallback(() => {
    if (!map || locations.length === 0) return;
    
    // Create a new bounds object
    const bounds = new mapboxgl.LngLatBounds();
    
    // Extend the bounds to include all location coordinates
    locations.forEach(location => {
      bounds.extend(location.coordinates);
    });
    
    // Fit the map to the bounds with some padding
    map.fitBounds(bounds, {
      padding: 50,
      duration: 1000
    });
  }, [map, locations]);
  
  // Get user's geolocation
  const getUserLocation = useCallback((): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          resolve([longitude, latitude]);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }, []);
  
  return (
    <MapContext.Provider 
      value={{
        // Map state
        map,
        isMapInitialized,
        setMap,
        setIsMapInitialized,
        mapStyle,
        setMapStyle,
        
        // Panel state
        activePanel,
        togglePanel,
        
        // Location state
        locations,
        isLoading,
        addLocation,
        deleteLocation,
        selectLocation,
        
        // Modal state
        isAddLocationModalOpen,
        newLocationCoordinates,
        openAddLocationModal,
        closeAddLocationModal,
        
        // Route state
        routeStartLocation,
        routeEndLocation,
        routeDirectionType,
        routeInfo,
        setRouteStartLocation,
        setRouteEndLocation,
        setRouteDirectionType,
        updateRouteInfo,
        
        // Map utilities
        fitToAllLocations,
        getUserLocation
      }}
    >
      {children}
    </MapContext.Provider>
  );
};