import { Location } from '../types';

const STORAGE_KEYS = {
  LOCATIONS: 'mapapp_locations'
} as const;

export const storageService = {
  saveLocations(locations: Location[]): void {
    try {
      console.log('Saving locations:', locations);
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
      // Verify save
      const saved = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
      console.log('Verified saved data:', saved);
    } catch (error) {
      console.error('Error saving locations to localStorage:', error);
    }
  },

  getLocations(): Location[] {
    try {
      const savedLocations = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
      console.log('Retrieved locations from storage:', savedLocations);
      return savedLocations ? JSON.parse(savedLocations) : [];
    } catch (error) {
      console.error('Error reading locations from localStorage:', error);
      return [];
    }
  }
}; 