import { useState } from 'react';
import { Location } from '../../../types';
import styles from './DirectionsPanel.module.css';

interface RouteInfo {
  distance: number;
  duration: number;
  steps: {
    maneuver: {
      instruction: string;
    };
    distance: number;
    duration: number;
  }[];
}

interface DirectionsPanelProps {
  locations: Location[];
  onRouteSelect: (start: Location, end: Location) => Promise<RouteInfo | undefined>;
}

export const DirectionsPanel = ({ locations, onRouteSelect }: DirectionsPanelProps) => {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const handleCalculateRoute = async () => {
    if (startLocation && endLocation) {
      const info = await onRouteSelect(startLocation, endLocation);
      if (info) {
        setRouteInfo(info);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  const formatDistance = (meters: number) => {
    const miles = meters / 1609.34;
    return `${miles.toFixed(1)} mi`;
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
              setRouteInfo(null);
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
              setRouteInfo(null);
            }}
          >
            <option value="">Select end point</option>
            {locations.map(location => (
              <option 
                key={location.id} 
                value={location.id}
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

      {routeInfo && (
        <div className={styles.routeInfo}>
          <div className={styles.routeSummary}>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Distance:</span>
              <span className={styles.value}>{formatDistance(routeInfo.distance)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Duration:</span>
              <span className={styles.value}>{formatDuration(routeInfo.duration)}</span>
            </div>
          </div>

          <div className={styles.steps}>
            <h4>Turn-by-turn directions:</h4>
            {routeInfo.steps.map((step, index) => (
              <div key={index} className={styles.step}>
                <div className={styles.stepInstruction}>
                  {step.maneuver.instruction}
                </div>
                <div className={styles.stepDetails}>
                  {formatDistance(step.distance)} · {formatDuration(step.duration)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 