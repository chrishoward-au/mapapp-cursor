import React from 'react';
import { List, Compass, Maximize, Globe, Map as MapIcon, LogOut } from 'lucide-react';
import styles from '../Map.module.css';
import { DarkModeToggle } from '../../DarkModeToggle';
import { useMapContext } from '../../../contexts/MapContext';
import { useAuth } from '../../../contexts/AuthContext';
import { changeMapStyle } from '../../../services/mapService';

export const ActionBar: React.FC = () => {
  const { 
    activePanel, 
    togglePanel, 
    locations, 
    fitToAllLocations,
    map,
    mapStyle,
    setMapStyle
  } = useMapContext();

  const { signOut } = useAuth();

  const handleMapStyleChange = () => {
    if (!map) return;
    
    // Toggle between map styles
    const newStyle = mapStyle === 'map' ? 'satellite' : 'map';
    setMapStyle(newStyle);
    
    // Update the map style
    changeMapStyle(map, newStyle === 'map' ? 'streets-v11' : 'satellite-v9');
  };

  return (
    <div className={styles.actionBar}>
      {/* Locations List Button */}
      <button
        className={`${styles.actionButton} ${activePanel === 'locations' ? styles.active : ''}`}
        onClick={() => togglePanel('locations')}
        aria-label="View saved locations"
      >
        <List size={20} />
      </button>

      {/* Directions Button */}
      <button
        className={`${styles.actionButton} ${activePanel === 'directions' ? styles.active : ''}`}
        onClick={() => togglePanel('directions')}
        aria-label="Get directions"
      >
        <Compass size={20} />
      </button>

      {/* View All Locations Button */}
      <button
        className={styles.actionButton}
        onClick={fitToAllLocations}
        disabled={locations.length < 2}
        aria-label="View all locations"
      >
        <Maximize size={20} />
      </button>

      {/* Map Style Toggle Button */}
      <button
        className={styles.actionButton}
        onClick={handleMapStyleChange}
        aria-label={mapStyle === 'map' ? 'Switch to satellite view' : 'Switch to map view'}
      >
        {mapStyle === 'map' ? <Globe size={20} /> : <MapIcon size={20} />}
      </button>

      <DarkModeToggle />

      <button
        className={styles.actionButton}
        onClick={signOut}
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
};