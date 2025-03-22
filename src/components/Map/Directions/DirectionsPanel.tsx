import React, { useState, useEffect } from 'react';
import styles from './DirectionsPanel.module.css';
import { Location } from '../../../types';

// Define direction types
export type DirectionType = 'driving' | 'walking' | 'cycling';

interface RouteInfo {
  distance: number;
  duration: number;
  steps: Array<{
    maneuver: {
      instruction: string;
    };
    distance: number;
  }>;
}

interface DirectionsPanelProps {
  locations: Location[];
  onRouteSelect: (start: Location, end: Location, directionType: DirectionType) => Promise<RouteInfo | undefined>;
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({ locations, onRouteSelect }) => {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [directionType, setDirectionType] = useState<DirectionType>('walking');

  // Clear route info when locations change
  useEffect(() => {
    setRouteInfo(null);
  }, [startLocation, endLocation]);

  // Automatically recalculate route when direction type changes if start and end are selected
  useEffect(() => {
    if (startLocation && endLocation) {
      handleCalculateRoute();
    }
  }, [directionType]);

  const handleCalculateRoute = async () => {
    if (!startLocation || !endLocation) return;
    
    try {
      const info = await onRouteSelect(startLocation, endLocation, directionType);
      if (info) {
        setRouteInfo(info);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const formatDistance = (meters: number): string => {
    return meters >= 1000
      ? `${(meters / 1000).toFixed(1)} km`
      : `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  // Get appropriate icon for direction type
  const getDirectionTypeIcon = (type: DirectionType) => {
    switch (type) {
      case 'driving':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
            <path d="M16 8h4l3 3v7a2 2 0 0 1-2 2h-5"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="15.5" cy="18.5" r="2.5"/>
          </svg>
        );
      case 'cycling':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="5" cy="17" r="3"/>
            <circle cx="19" cy="17" r="3"/>
            <path d="M9 17H5.34"/>
            <path d="M19 17h-3.66"/>
            <path d="M14.29 7.71 12 10l-2.29-2.29a1 1 0 0 1 0-1.42l4.58-4.58a1 1 0 0 1 1.42 0L17 3"/>
            <path d="m12 10-3 3 2.83 2.83a1 1 0 0 0 1.41 0L15 14l-3-4Z"/>
          </svg>
        );
      case 'walking':
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 4v16"/>
            <path d="M19 4v10"/>
            <path d="M7 4v6"/>
            <path d="M7 14v6"/>
            <path d="M19 16v4"/>
          </svg>
        );
    }
  };

  return (
    <div className={styles.directionsPanel}>
      <h3 className={styles.title}>Directions</h3>
      
      <div className={styles.directionTypeToggle}>
        <div className={styles.toggleTitle}>Transport mode:</div>
        <div className={styles.toggleButtons}>
          <button 
            className={`${styles.toggleButton} ${directionType === 'walking' ? styles.active : ''}`}
            onClick={() => setDirectionType('walking')}
            title="Walking"
          >
            {getDirectionTypeIcon('walking')}
          </button>
          <button 
            className={`${styles.toggleButton} ${directionType === 'cycling' ? styles.active : ''}`}
            onClick={() => setDirectionType('cycling')}
            title="Cycling"
          >
            {getDirectionTypeIcon('cycling')}
          </button>
          <button 
            className={`${styles.toggleButton} ${directionType === 'driving' ? styles.active : ''}`}
            onClick={() => setDirectionType('driving')}
            title="Driving"
          >
            {getDirectionTypeIcon('driving')}
          </button>
        </div>
      </div>
      
      <div className={styles.locationSelect}>
        <label>
          Start:
          <select 
            value={startLocation?.id || ""} 
            onChange={(e) => {
              const selected = locations.find(loc => loc.id === e.target.value);
              setStartLocation(selected || null);
            }}
          >
            <option value="">Select start location</option>
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
          End:
          <select 
            value={endLocation?.id || ""} 
            onChange={(e) => {
              const selected = locations.find(loc => loc.id === e.target.value);
              setEndLocation(selected || null);
            }}
          >
            <option value="">Select end location</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
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
          <div className={styles.summary}>
            <div>
              <span className={styles.directionTypeText}>{directionType.charAt(0).toUpperCase() + directionType.slice(1)}</span>
              <span> · </span>
              <span>{formatDistance(routeInfo.distance)}</span>
              <span> · </span>
              <span>{formatDuration(routeInfo.duration)}</span>
            </div>
          </div>
          
          <div className={styles.steps}>
            <h4>Directions:</h4>
            <ol>
              {routeInfo.steps.map((step, index) => (
                <li key={index}>
                  <div dangerouslySetInnerHTML={{ __html: step.maneuver.instruction }} />
                  <div className={styles.stepDistance}>{formatDistance(step.distance)}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}; 