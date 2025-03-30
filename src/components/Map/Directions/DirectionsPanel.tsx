import React, { useState, useEffect } from 'react';
import styles from './DirectionsPanel.module.css';
import { Car, Bike, X, Footprints, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
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
  const [expandedSteps, setExpandedSteps] = useState<boolean>(true);

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
  const getDirectionTypeIcon = (type: DirectionType, size = 18) => {
    switch (type) {
      case 'driving':
        return <Car size={size} />;
      case 'cycling':
        return <Bike size={size} />;
      case 'walking':
      default:
        return <Footprints size={size} />;
    }
  };

  // Toggle directions steps visibility
  const toggleSteps = () => {
    setExpandedSteps(!expandedSteps);
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
      
      {/* Route inputs container */}
      <div className={styles.routeInputs}>
        {/* Mode selector as tabs */}
        <div className={styles.travelModeTabs}>
          <button 
            className={`${styles.modeTab} ${routeDirectionType === 'walking' ? styles.active : ''}`}
            onClick={() => setRouteDirectionType('walking')}
            title="Walking"
          >
            {getDirectionTypeIcon('walking')}
            <span className={styles.modeLabel}>Walk</span>
          </button>
          <button 
            className={`${styles.modeTab} ${routeDirectionType === 'cycling' ? styles.active : ''}`}
            onClick={() => setRouteDirectionType('cycling')}
            title="Cycling"
          >
            {getDirectionTypeIcon('cycling')}
            <span className={styles.modeLabel}>Bike</span>
          </button>
          <button 
            className={`${styles.modeTab} ${routeDirectionType === 'driving' ? styles.active : ''}`}
            onClick={() => setRouteDirectionType('driving')}
            title="Driving"
          >
            {getDirectionTypeIcon('driving')}
            <span className={styles.modeLabel}>Drive</span>
          </button>
        </div>
        
        {/* Location selectors with improved layout */}
        <div className={styles.locationSelectors}>
          <div className={styles.locationInputGroup}>
            <div className={styles.locationLabel}>From</div>
            <select 
              className={styles.locationInput}
              value={routeStartLocation?.id || ""} 
              onChange={(e) => {
                const selected = locations.find(loc => loc.id === e.target.value);
                setRouteStartLocation(selected || null);
              }}
              aria-label="Select start location"
            >
              <option value="">Select start location</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.locationDivider}>
            <ArrowRight size={14} />
          </div>
          
          <div className={styles.locationInputGroup}>
            <div className={styles.locationLabel}>To</div>
            <select 
              className={styles.locationInput}
              value={routeEndLocation?.id || ""} 
              onChange={(e) => {
                const selected = locations.find(loc => loc.id === e.target.value);
                setRouteEndLocation(selected || null);
              }}
              aria-label="Select end location"
            >
              <option value="">Select end location</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Route information card */}
      {routeInfo && (
        <div className={styles.routeInfo}>
          {/* Summary card with prominent display */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              {getDirectionTypeIcon(routeDirectionType, 22)}
            </div>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryTime}>{formatDuration(routeInfo.duration)}</div>
              <div className={styles.summaryDistance}>{formatDistance(routeInfo.distance)}</div>
            </div>
          </div>

          {/* Route alternatives - redesigned for better mobile UX */}
          {routeInfo.routeOptions && routeInfo.routeOptions > 1 && (
            <div className={styles.routeAlternatives}>
              <div className={styles.routeAlternativesHeader}>
                <span>Route options</span>
                <span className={styles.routeCounter}>{(routeInfo.currentRouteIndex || 0) + 1} of {routeInfo.routeOptions}</span>
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
          
          {/* Directions steps with toggle for mobile optimization */}
          <div className={styles.stepsContainer}>
            <div 
              className={styles.stepsHeader} 
              onClick={toggleSteps}
              role="button"
              tabIndex={0}
              aria-expanded={expandedSteps}
            >
              <h4>
                Directions 
                <span className={styles.stepCount}>({routeInfo.steps.length} steps)</span>
              </h4>
              <button 
                className={`${styles.expandCollapseBtn} ${expandedSteps ? styles.expanded : ''}`}
                aria-label={expandedSteps ? "Collapse directions" : "Expand directions"}
              >
                {expandedSteps ? '−' : '+'}
              </button>
            </div>
            
            {expandedSteps && (
              <div className={styles.steps}>
                <ol>
                  {routeInfo.steps.map((step, index) => (
                    <li key={index} className={styles.stepItem}>
                      <div className={styles.stepContent}>
                        <div className={styles.stepInstruction} dangerouslySetInnerHTML={{ __html: step.maneuver.instruction }} />
                        <div className={styles.stepDistance}>{formatDistance(step.distance)}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};