import React from 'react';
import { Globe, Map as MapIcon } from 'lucide-react';
import styles from '../Map.module.css';
import { UserPreferences } from '../../../types';

interface MapControlsProps {
  mapStyle: string;
  onMapStyleChange: (style: UserPreferences['defaultMapLayer']) => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  mapStyle,
  onMapStyleChange
}) => {
  return (
    <div className={styles.mapControls}>
      <button
        className={styles.styleToggle}
        onClick={() => onMapStyleChange(mapStyle === 'streets-v11' ? 'satellite' : 'map')}
        aria-label={mapStyle === 'streets-v11' ? 'Switch to satellite view' : 'Switch to map view'}
      >
        {mapStyle === 'streets-v11' ? <Globe size={20} /> : <MapIcon size={20} />}
      </button>
    </div>
  );
}; 