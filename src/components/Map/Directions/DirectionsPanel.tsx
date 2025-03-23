import React, { useState, useEffect } from 'react';
import styles from './DirectionsPanel.module.css';
import { Location } from '../../../types';
import { Car, Bike, X, Footprints, ChevronLeft, ChevronRight } from 'lucide-react';

// Define direction types
export type DirectionType = 'driving' | 'walking' | 'cycling';

export interface RouteInfo {
  distance: number;
  duration: number;
  steps: Array<{
    maneuver: {
      instruction: string;
    };
    distance: number;
  }>;
  routeOptions?: number;
  currentRouteIndex?: number;
}

interface DirectionsPanelProps {
  locations: Location[];
  onRouteSelect: (start: Location, end: Location, directionType: DirectionType) => Promise<RouteInfo | undefined>;
  onRouteChange: (routeIndex: number) => Promise<RouteInfo | undefined>;
  // New props for controlling route state from parent
  startLocation: Location | null;
  endLocation: Location | null;
  directionType: DirectionType;
  availableRoutes: number;
  currentRouteIndex: number;
  onStartLocationChange: (location: Location | null) => void;
  onEndLocationChange: (location: Location | null) => void;
  onDirectionTypeChange: (type: DirectionType) => void;
  onClose: () => void; // New prop for closing the panel
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  locations,
  onRouteSelect,
  onRouteChange,
  startLocation,
  endLocation,
  directionType,
  availableRoutes,
  currentRouteIndex,
  onStartLocationChange,
  onEndLocationChange,
  onDirectionTypeChange,
  onClose
}) => {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [prevStartId, setPrevStartId] = useState<string | null>(null);
  const [prevEndId, setPrevEndId] = useState<string | null>(null);
  const [prevDirType, setPrevDirType] = useState<DirectionType | null>(null);

  // Only calculate route when values actually change, not just on panel reopen
  useEffect(() => {
    const startId = startLocation?.id || null;
    const endId = endLocation?.id || null;
    
    // Only trigger calculation if something actually changed
    if (startLocation && endLocation && 
        (startId !== prevStartId || endId !== prevEndId || directionType !== prevDirType)) {
      handleCalculateRoute();
      // Store current values to compare against for future changes
      setPrevStartId(startId);
      setPrevEndId(endId);
      setPrevDirType(directionType);
    } else if (!startLocation || !endLocation) {
      setRouteInfo(null);
    }
  }, [startLocation, endLocation, directionType]);

  // Update route info when currentRouteIndex changes
  useEffect(() => {
    if (availableRoutes > 0 && startLocation && endLocation) {
      handleRouteOptionChange(currentRouteIndex);
    }
  }, [currentRouteIndex, availableRoutes]);

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

  // Handle changing route options
  const handleRouteOptionChange = async (index: number) => {
    if (availableRoutes > 0) {
      // Implement looping behavior
      let nextIndex = index;
      
      // If going past the last route, loop to the first
      if (nextIndex >= availableRoutes) {
        nextIndex = 0;
      }
      
      // If going before the first route, loop to the last
      if (nextIndex < 0) {
        nextIndex = availableRoutes - 1;
      }
      
      try {
        const info = await onRouteChange(nextIndex);
        if (info) {
          setRouteInfo(info);
        }
      } catch (error) {
        console.error('Error changing route option:', error);
      }
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
        return <Car size={16} />;
      case 'cycling':
        return <Bike size={16} />;
      case 'walking':
      default:
        return <Footprints size={16} />;
    }
  };

  return (
    <div className={styles.directionsPanel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.title}>Directions</h3>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close directions panel">
          <X size={16} />
        </button>
      </div>
      
      <div className={styles.directionTypeToggle}>
        <div className={styles.toggleTitle}>Transport mode:</div>
        <div className={styles.toggleButtons}>
          <button 
            className={`${styles.toggleButton} ${directionType === 'walking' ? styles.active : ''}`}
            onClick={() => onDirectionTypeChange('walking')}
            title="Walking"
          >
            {getDirectionTypeIcon('walking')}
          </button>
          <button 
            className={`${styles.toggleButton} ${directionType === 'cycling' ? styles.active : ''}`}
            onClick={() => onDirectionTypeChange('cycling')}
            title="Cycling"
          >
            {getDirectionTypeIcon('cycling')}
          </button>
          <button 
            className={`${styles.toggleButton} ${directionType === 'driving' ? styles.active : ''}`}
            onClick={() => onDirectionTypeChange('driving')}
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
              onStartLocationChange(selected || null);
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
              onEndLocationChange(selected || null);
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

          {/* Route alternatives navigator - only show if there are multiple routes */}
          {availableRoutes > 1 && (
            <div className={styles.routeAlternatives}>
              <div className={styles.routeAlternativesTitle}>
                Route options ({currentRouteIndex + 1}/{availableRoutes})
              </div>
              <div className={styles.routeNavigator}>
                <button 
                  className={styles.routeNavButton}
                  onClick={() => handleRouteOptionChange(currentRouteIndex - 1)}
                  aria-label="Previous route option"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className={styles.routeIndicators}>
                  {[...Array(availableRoutes)].map((_, index) => (
                    <button
                      key={index}
                      className={`${styles.routeDot} ${index === currentRouteIndex ? styles.active : ''}`}
                      onClick={() => handleRouteOptionChange(index)}
                      aria-label={`Route option ${index + 1}`}
                    />
                  ))}
                </div>
                <button 
                  className={styles.routeNavButton}
                  onClick={() => handleRouteOptionChange(currentRouteIndex + 1)}
                  aria-label="Next route option"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
          
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