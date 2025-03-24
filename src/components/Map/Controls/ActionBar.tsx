import React from 'react';
import { List, Compass, Maximize } from 'lucide-react';
import styles from '../Map.module.css';
import { Location } from '../../../types';
import { DarkModeToggle } from '../../DarkModeToggle';

interface ActionBarProps {
  locations: Location[];
  activePanel: string;
  onViewLocations: () => void;
  onViewDirections: () => void;
  onViewAllLocations: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  locations,
  activePanel,
  onViewLocations,
  onViewDirections,
  onViewAllLocations
}) => {
  return (
    <div className={styles.actionBar}>
      {/* Locations List Button */}
      <button
        className={`${styles.actionButton} ${activePanel === 'locations' ? styles.active : ''}`}
        onClick={onViewLocations}
        aria-label="View saved locations"
      >
        <List size={20} />
      </button>

      {/* Directions Button */}
      <button
        className={`${styles.actionButton} ${activePanel === 'directions' ? styles.active : ''}`}
        onClick={onViewDirections}
        aria-label="Get directions"
      >
        <Compass size={20} />
      </button>

      {/* View All Locations Button */}
      <button
        className={styles.actionButton}
        onClick={onViewAllLocations}
        disabled={locations.length < 2}
        aria-label="View all locations"
      >
        <Maximize size={20} />
      </button>

      <DarkModeToggle />
    </div>
  );
}; 