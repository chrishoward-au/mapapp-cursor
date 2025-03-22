import React, { useState, useEffect, useRef } from 'react';
import styles from './AddLocationModal.module.css';

interface AddLocationModalProps {
  isOpen: boolean;
  coordinates: [number, number] | null;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({ 
  isOpen, 
  coordinates, 
  onSave, 
  onCancel 
}) => {
  const [locationName, setLocationName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLocationName('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationName.trim()) {
      onSave(locationName.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Add Location</h3>
          <button 
            className={styles.closeButton} 
            onClick={onCancel}
            aria-label="Close modal"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="location-name">Location Name</label>
            <input
              ref={inputRef}
              id="location-name"
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Enter a name for this location"
              className={styles.input}
              required
            />
          </div>
          
          {coordinates && (
            <div className={styles.coordinates}>
              <small>
                Coordinates: {coordinates[1].toFixed(6)}, {coordinates[0].toFixed(6)}
              </small>
            </div>
          )}

          <div className={styles.buttonGroup}>
            <button 
              type="button" 
              className={styles.cancelButton} 
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={!locationName.trim()}
            >
              Save Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 