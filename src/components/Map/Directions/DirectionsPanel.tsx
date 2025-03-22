import { useState, useEffect } from 'react';
import styles from './DirectionsPanel.module.css';
import { Location } from '../../../types';

interface DirectionsPanelProps {
  locations: Location[];
  onRouteSelect: (start: Location, end: Location) => Promise<RouteInfo | undefined>;
}

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

export const DirectionsPanel = ({ locations, onRouteSelect }: DirectionsPanelProps) => {
  const [startLocationId, setStartLocationId] = useState<string>('');
  const [endLocationId, setEndLocationId] = useState<string>('');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  // Clear route info when location selections change
  useEffect(() => {
    setRouteInfo(null);
  }, [startLocationId, endLocationId]);

  const handleCalculateRoute = async () => {
    if (!startLocationId || !endLocationId) {
      alert('Please select start and end locations');
      return;
    }

    const startLocation = locations.find(loc => loc.id === startLocationId);
    const endLocation = locations.find(loc => loc.id === endLocationId);

    if (!startLocation || !endLocation) {
      alert('Invalid locations selected');
      return;
    }

    const info = await onRouteSelect(startLocation, endLocation);
    if (info) {
      setRouteInfo(info);
    }
  };

  // Format distance in miles
  const formatDistance = (meters: number) => {
    const miles = meters / 1609.34;
    return miles < 0.1 
      ? `${Math.round(miles * 5280)} ft` 
      : `${miles.toFixed(1)} mi`;
  };

  // Format duration in minutes/hours
  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hr ${remainingMinutes} min`;
    }
  };

  return (
    <div className={styles.container}>
      <h2>Get Directions</h2>
      
      <div className={styles.inputGroup}>
        <label htmlFor="start-location">Start</label>
        <select 
          id="start-location"
          value={startLocationId}
          onChange={(e) => setStartLocationId(e.target.value)}
          className={styles.locationSelect}
        >
          <option value="">Select starting point</option>
          {locations.map(location => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className={styles.inputGroup}>
        <label htmlFor="end-location">End</label>
        <select 
          id="end-location"
          value={endLocationId}
          onChange={(e) => setEndLocationId(e.target.value)}
          className={styles.locationSelect}
        >
          <option value="">Select destination</option>
          {locations.map(location => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>
      
      <button 
        className={styles.calculateButton}
        onClick={handleCalculateRoute}
        disabled={!startLocationId || !endLocationId}
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

          <h3>Directions</h3>
          <ol className={styles.directions}>
            {routeInfo.steps.map((step, index) => (
              <li key={index} className={styles.step}>
                <div className={styles.instruction}>{step.maneuver.instruction}</div>
                <div className={styles.stepDetails}>
                  <span className={styles.stepDistance}>{formatDistance(step.distance)}</span>
                  {step.duration > 30 && (
                    <span className={styles.stepDuration}>{formatDuration(step.duration)}</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}; 