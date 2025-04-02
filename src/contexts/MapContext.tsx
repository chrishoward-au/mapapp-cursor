import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Location } from '../types';
import { DirectionType } from '../components/Map/Directions/DirectionsPanel';
import { storageService } from '../services/storage';
import { RouteInfo } from '../components/Map/Routes/RouteManager';
import { useAuth } from './AuthContext'; // Import the Auth context

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
  currentRouteIndex: number;
  setRouteStartLocation: (location: Location | null) => void;
  setRouteEndLocation: (location: Location | null) => void;
  setRouteDirectionType: (type: DirectionType) => void;
  updateRouteInfo: (info: RouteInfo | null) => void;
  setCurrentRouteIndex: (index: number) => void;
  
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
  // Get authentication context
  const { user } = useAuth();
  
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
  const [currentRouteIndex, setCurrentRouteIndexState] = useState<number>(0);
  
  // Update route info (called by RouteManager)
  const updateRouteInfo = useCallback((info: RouteInfo | null) => {
    setRouteInfo(info);
    // Only update index if info is not null, otherwise reset to 0
    setCurrentRouteIndexState(info?.currentRouteIndex ?? 0);
  }, []);

  // Set the selected route index (called by DirectionsPanel)
  const setCurrentRouteIndex = useCallback((index: number) => {
    setCurrentRouteIndexState(index);
  }, []);
  
  // Load locations from Supabase when user changes or on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setIsLoading(true);
        
        // Clear locations if there's no user
        if (!user) {
          console.log('No authenticated user, clearing locations');
          setLocations([]);
          return;
        }
        
        console.log('Loading locations for user:', user.id);
        const storedLocations = await storageService.getLocations();
        setLocations(storedLocations);
      } catch (error) {
        console.error('Failed to load locations:', error);
        setLocations([]); // Ensure locations are cleared on error
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLocations();
  }, [user]); // Re-run when user changes
  
  // Panel toggle handler
  const togglePanel = useCallback((panel: 'locations' | 'directions') => {
    setActivePanel(current => current === panel ? 'none' : panel);
  }, []);
  
  // Location handlers
  const addLocation = useCallback(async (name: string, coordinates: [number, number]) => {
    try {
      const addedLocation = await storageService.addLocation(name, coordinates);
      setLocations(prev => [...prev, addedLocation]);
    } catch (error) {
      console.error("Failed to add location:", error);
    }
  }, []);
  
  const deleteLocation = useCallback(async (locationId: string) => {
    try {
      await storageService.deleteLocation(locationId);
      setLocations(prev => prev.filter(loc => loc.id !== locationId));
    } catch (error) {
      console.error("Failed to delete location:", error);
    }
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
        currentRouteIndex,
        setRouteStartLocation,
        setRouteEndLocation,
        setRouteDirectionType,
        updateRouteInfo,
        setCurrentRouteIndex,
        
        // Map utilities
        fitToAllLocations,
        getUserLocation
      }}
    >
      {children}
    </MapContext.Provider>
  );
};