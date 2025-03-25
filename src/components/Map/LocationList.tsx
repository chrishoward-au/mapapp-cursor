import { X } from 'lucide-react';
import styles from './LocationList.module.css';
import { useMapContext } from '../../contexts/MapContext';

export const LocationList = () => {
  const {
    locations,
    selectLocation,
    deleteLocation,
    togglePanel
  } = useMapContext();

  return (
    <div className={styles.locationList}>
      <div className={styles.panelHeader}>
        <h3 className={styles.title}>Saved Locations</h3>
        <button 
          className={styles.closeButton} 
          onClick={() => togglePanel('locations')} 
          aria-label="Close locations panel"
        >
          <X size={16} />
        </button>
      </div>
      
      {locations.length === 0 ? (
        <p className={styles.emptyState}>Click on the map to add locations</p>
      ) : (
        <ul className={styles.list}>
          {locations.map((location) => (
            <li key={location.id} className={styles.listItem}>
              <button
                className={styles.locationButton}
                onClick={() => selectLocation(location)}
              >
                {location.name}
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => deleteLocation(location.id)}
                aria-label="Delete location"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};