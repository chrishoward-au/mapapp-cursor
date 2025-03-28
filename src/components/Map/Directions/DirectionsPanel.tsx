import React, { useState, useEffect } from 'react';
import styles from './DirectionsPanel.module.css';
import { Car, Bike, X, Footprints, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMapContext } from '../../../contexts/MapContext';

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

export const DirectionsPanel: React.FC = () => {
  const {
    locations,
    togglePanel,
    routeStartLocation,
    routeEndLocation,
    routeDirectionType,
    routeInfo,
    setRouteStartLocation,
    setRouteEndLocation,
    setRouteDirectionType,
    setCurrentRouteIndex
  } = useMapContext();

  const [prevStartId, setPrevStartId] = useState<string | null>(null);
  const [prevEndId, setPrevEndId] = useState<string | null>(null);
  const [prevDirType, setPrevDirType] = useState<DirectionType | null>(null);

  // Track changing values to determine when to recalculate routes
  useEffect(() => {
    const startId = routeStartLocation?.id || null;
    const endId = routeEndLocation?.id || null;
    
    // Update trackers for detecting changes
    if (startId !== prevStartId || endId !== prevEndId || routeDirectionType !== prevDirType) {
      setPrevStartId(startId);
      setPrevEndId(endId);
      setPrevDirType(routeDirectionType);
    }
  }, [routeStartLocation, routeEndLocation, routeDirectionType]);

  // Utility functions for formatting
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
        <button 
          className={styles.closeButton} 
          onClick={() => togglePanel('directions')} 
          aria-label="Close directions panel"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className={styles.directionTypeToggle}>
        <div className={styles.toggleTitle}>Transport mode:</div>
        <div className={styles.toggleButtons}>
          <button 
            className={`${styles.toggleButton} ${routeDirectionType === 'walking' ? styles.active : ''}`}
            onClick={() => setRouteDirectionType('walking')}
            title="Walking"
          >
            {getDirectionTypeIcon('walking')}
          </button>
          <button 
            className={`${styles.toggleButton} ${routeDirectionType === 'cycling' ? styles.active : ''}`}
            onClick={() => setRouteDirectionType('cycling')}
            title="Cycling"
          >
            {getDirectionTypeIcon('cycling')}
          </button>
          <button 
            className={`${styles.toggleButton} ${routeDirectionType === 'driving' ? styles.active : ''}`}
            onClick={() => setRouteDirectionType('driving')}
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
            value={routeStartLocation?.id || ""} 
            onChange={(e) => {
              const selected = locations.find(loc => loc.id === e.target.value);
              setRouteStartLocation(selected || null);
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
            value={routeEndLocation?.id || ""} 
            onChange={(e) => {
              const selected = locations.find(loc => loc.id === e.target.value);
              setRouteEndLocation(selected || null);
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
              <span className={styles.directionTypeText}>
                {routeDirectionType.charAt(0).toUpperCase() + routeDirectionType.slice(1)}
              </span>
              <span> · </span>
              <span>{formatDistance(routeInfo.distance)}</span>
              <span> · </span>
              <span>{formatDuration(routeInfo.duration)}</span>
            </div>
          </div>

          {/* Route alternatives navigator - only show if there are multiple routes */}
          {routeInfo.routeOptions && routeInfo.routeOptions > 1 && (
            <div className={styles.routeAlternatives}>
              <div className={styles.routeAlternativesTitle}>
                Route options ({(routeInfo.currentRouteIndex || 0) + 1}/{routeInfo.routeOptions})
              </div>
              <div className={styles.routeNavigator}>
                <button 
                  className={styles.routeNavButton}
                  aria-label="Previous route option"
                  onClick={() => {
                    if (!routeInfo || routeInfo.currentRouteIndex === undefined || routeInfo.routeOptions === undefined) return;
                    const prevIndex = (routeInfo.currentRouteIndex - 1 + routeInfo.routeOptions) % routeInfo.routeOptions;
                    setCurrentRouteIndex(prevIndex);
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <div className={styles.routeIndicators}>
                  {routeInfo.routeOptions && [...Array(routeInfo.routeOptions)].map((_, index) => (
                    <button
                      key={index}
                      className={`${styles.routeDot} ${index === (routeInfo.currentRouteIndex || 0) ? styles.active : ''}`}
                      aria-label={`Route option ${index + 1}`}
                      onClick={() => setCurrentRouteIndex(index)}
                    />
                  ))}
                </div>
                <button 
                  className={styles.routeNavButton}
                  aria-label="Next route option"
                  onClick={() => {
                    if (!routeInfo || routeInfo.currentRouteIndex === undefined || routeInfo.routeOptions === undefined) return;
                    const nextIndex = (routeInfo.currentRouteIndex + 1) % routeInfo.routeOptions;
                    setCurrentRouteIndex(nextIndex);
                  }}
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