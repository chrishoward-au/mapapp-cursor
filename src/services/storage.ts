import { Location } from '../types';

const LOCATIONS_KEY = 'mapApp.locations';

/**
 * Storage service to handle local storage operations
 */
export const storageService = {
  /**
   * Save locations to local storage
   */
  saveLocations(locations: Location[]): void {
    try {
      localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
    } catch (error) {
      console.error('Failed to save locations to local storage:', error);
    }
  },

  /**
   * Get locations from local storage
   */
  getLocations(): Location[] {
    try {
      const data = localStorage.getItem(LOCATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to retrieve locations from local storage:', error);
      return [];
    }
  }
}; 