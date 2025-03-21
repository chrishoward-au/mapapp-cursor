import { useState } from 'react';
import { Location } from '../../../types';
import styles from './DirectionsPanel.module.css';

interface DirectionsPanelProps {
  locations: Location[];
  onRouteSelect: (start: Location, end: Location) => void;
}

export const DirectionsPanel = ({ locations, onRouteSelect }: DirectionsPanelProps) => {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);

  const handleCalculateRoute = () => {
    if (startLocation && endLocation) {
      onRouteSelect(startLocation, endLocation);
    }
  };

  return (
    <div className={styles.directionsPanel}>
      <h3 className={styles.title}>Directions</h3>
      
      <div className={styles.locationSelect}>
        <label>
          Start Location:
          <select
            value={startLocation?.id || ''}
            onChange={(e) => {
              const location = locations.find(loc => loc.id === e.target.value);
              setStartLocation(location || null);
            }}
          >
            <option value="">Select start point</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.locationSelect}>
        <label>
          End Location:
          <select
            value={endLocation?.id || ''}
            onChange={(e) => {
              const location = locations.find(loc => loc.id === e.target.value);
              setEndLocation(location || null);
            }}
          >
            <option value="">Select end point</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}
                disabled={location.id === startLocation?.id}
              >
                {location.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        className={styles.calculateButton}
        onClick={handleCalculateRoute}
        disabled={!startLocation || !endLocation}
      >
        Calculate Route
      </button>
    </div>
  );
}; 