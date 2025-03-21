import { useState } from 'react';
import styles from './LayerToggle.module.css';

interface LayerToggleProps {
  onLayerChange: (style: 'map' | 'satellite') => void;
}

export const LayerToggle = ({ onLayerChange }: LayerToggleProps) => {
  const [currentLayer, setCurrentLayer] = useState<'map' | 'satellite'>('map');

  const handleLayerChange = (layer: 'map' | 'satellite') => {
    setCurrentLayer(layer);
    onLayerChange(layer);
  };

  return (
    <div className={styles.layerToggle}>
      <button
        className={`${styles.toggleButton} ${currentLayer === 'map' ? styles.active : ''}`}
        onClick={() => handleLayerChange('map')}
      >
        Map
      </button>
      <button
        className={`${styles.toggleButton} ${currentLayer === 'satellite' ? styles.active : ''}`}
        onClick={() => handleLayerChange('satellite')}
      >
        Satellite
      </button>
    </div>
  );
}; 