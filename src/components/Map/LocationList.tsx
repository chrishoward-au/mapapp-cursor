import { Location } from '../../types';
import styles from './LocationList.module.css';

interface LocationListProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  onLocationDelete: (locationId: string) => void;
  onClose: () => void;
}

export const LocationList = ({
  locations,
  onLocationSelect,
  onLocationDelete,
  onClose,
}: LocationListProps) => {
  return (
    <div className={styles.locationList}>
      <div className={styles.panelHeader}>
        <h3 className={styles.title}>Saved Locations</h3>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close locations panel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
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
                onClick={() => onLocationSelect(location)}
              >
                {location.name}
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => onLocationDelete(location.id)}
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