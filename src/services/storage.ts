import { Location } from '../types';

const STORAGE_KEYS = {
  LOCATIONS: 'mapapp_locations'
} as const;

export const storageService = {
  saveLocations(locations: Location[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    } catch (error) {
      console.error('Error saving locations to localStorage:', error);
    }
  },

  getLocations(): Location[] {
    try {
      const savedLocations = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
      return savedLocations ? JSON.parse(savedLocations) : [];
    } catch (error) {
      console.error('Error reading locations from localStorage:', error);
      return [];
    }
  }
}; 