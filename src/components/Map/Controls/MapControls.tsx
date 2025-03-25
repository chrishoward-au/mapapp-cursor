import React from 'react';
import { Globe, Map as MapIcon } from 'lucide-react';
import styles from '../Map.module.css';
import { useMapContext } from '../../../contexts/MapContext';
import { changeMapStyle } from '../../../services/mapService';

export const MapControls: React.FC = () => {
  const { map, mapStyle, setMapStyle } = useMapContext();

  const handleMapStyleChange = () => {
    if (!map) return;
    
    // Toggle between map styles
    const newStyle = mapStyle === 'map' ? 'satellite' : 'map';
    setMapStyle(newStyle);
    
    // Update the map style
    changeMapStyle(map, newStyle === 'map' ? 'streets-v11' : 'satellite-v9');
  };

  return (
    <div className={styles.mapControls}>
      <button
        className={styles.styleToggle}
        onClick={handleMapStyleChange}
        aria-label={mapStyle === 'map' ? 'Switch to satellite view' : 'Switch to map view'}
      >
        {mapStyle === 'map' ? <Globe size={20} /> : <MapIcon size={20} />}
      </button>
    </div>
  );
};