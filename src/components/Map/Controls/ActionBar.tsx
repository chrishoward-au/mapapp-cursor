import React from 'react';
import { List, Compass, Maximize } from 'lucide-react';
import styles from '../Map.module.css';
import { DarkModeToggle } from '../../DarkModeToggle';
import { useMapContext } from '../../../contexts/MapContext';

export const ActionBar: React.FC = () => {
  const { 
    activePanel, 
    togglePanel, 
    locations, 
    fitToAllLocations 
  } = useMapContext();

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

      <DarkModeToggle />
    </div>
  );
};