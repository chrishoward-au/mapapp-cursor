import React, { /* useEffect, useState */ } from 'react'; // Comment out unused imports
// import mapboxgl from 'mapbox-gl'; // <-- REMOVE UNUSED IMPORT
import { Location } from '../../../types';
// storageService import likely no longer needed here if we remove load/save
// import { storageService } from '../../../services/storage';

interface LocationManagerProps {
  map: mapboxgl.Map | null; // Prop might be unused now
  locations: Location[]; // Prop might be unused now
  onLocationsChange: (locations: Location[]) => void; // Prop might be unused now
  onLocationSelect: (location: Location) => void; // Prop might be unused now
}

export const LocationManager: React.FC<LocationManagerProps> = ({
  // map, // Prop might be unused now
  // locations, // Prop might be unused now
  // onLocationsChange, // Prop might be unused now
  // onLocationSelect // Prop might be unused now
}) => {
  // const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]); // State no longer needed

  // REMOVED: useEffect for creating/updating markers
  // useEffect(() => {
  //  ...
  // }, [map, locations, onLocationSelect]); 

  // REMOVED: useEffect for loading locations
  // useEffect(() => { ... });

  // REMOVED: useEffect for saving locations
  // useEffect(() => { ... });

  // Component is now effectively empty
  return null;
}; 