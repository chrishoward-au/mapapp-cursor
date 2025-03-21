import { Location } from '../../types';
import styles from './LocationList.module.css';

interface LocationListProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  onLocationDelete: (locationId: string) => void;
}

export const LocationList = ({
  locations,
  onLocationSelect,
  onLocationDelete,
}: LocationListProps) => {
  return (
    <div className={styles.locationList}>
      <h3 className={styles.title}>Saved Locations</h3>
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