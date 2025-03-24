import { Location, UserPreferences } from '../types';

const DB_NAME = 'mapAppDB';
const DB_VERSION = 1;
const LOCATIONS_STORE = 'locations';
const LOCALSTORAGE_KEY = 'mapApp.locations.fallback';
const PREFERENCES_KEY = 'mapApp.preferences';
const DEFAULT_PREFERENCES: UserPreferences = {
  defaultMapLayer: 'map',
  defaultCenter: [-0.118092, 51.509865], // London as default
  defaultZoom: 12,
  weatherLayerEnabled: false
};

/**
 * Storage service with fallback to localStorage if IndexedDB is not available
 */
export const storageService = {
  /**
   * Initialize the database
   */
  async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        reject('Failed to open IndexedDB');
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Create the locations object store if it doesn't exist
        if (!db.objectStoreNames.contains(LOCATIONS_STORE)) {
          db.createObjectStore(LOCATIONS_STORE, { keyPath: 'id' });
        }
      };
    });
  },

  /**
   * Save locations to storage (IndexedDB with localStorage fallback)
   */
  async saveLocations(locations: Location[]): Promise<void> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([LOCATIONS_STORE], 'readwrite');
        const store = transaction.objectStore(LOCATIONS_STORE);
        
        // Clear all existing locations
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          // Add all new locations
          locations.forEach(location => {
            store.add(location);
          });
        };
        
        transaction.oncomplete = () => {
          // Also save to localStorage as a fallback
          try {
            localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(locations));
          } catch (e) {
            console.warn('Unable to save to localStorage fallback:', e);
          }
          db.close();
          resolve();
        };
        
        transaction.onerror = (event) => {
          console.error('Transaction error:', event);
          // Try localStorage fallback
          try {
            localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(locations));
            resolve();
          } catch (e) {
            reject('Failed to save locations: ' + e);
          }
        };
      });
    } catch (error) {
      console.error('IndexedDB save error:', error);
      // Fallback to localStorage
      try {
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(locations));
      } catch (e) {
        console.error('Complete storage failure:', e);
      }
    }
  },

  /**
   * Get locations from storage (IndexedDB with localStorage fallback)
   */
  async getLocations(): Promise<Location[]> {
    try {
      const db = await this.initDB();
      
      // Try to get locations from IndexedDB first
      if (db) {
        return new Promise((resolve) => {
          const transaction = db.transaction([LOCATIONS_STORE], 'readonly');
          const store = transaction.objectStore(LOCATIONS_STORE);
          const request = store.getAll();
          
          request.onsuccess = () => {
            const locations = request.result;
            db.close();
            resolve(locations);
          };
          
          request.onerror = () => {
            console.warn('Error fetching from IndexedDB, falling back to localStorage');
            // Fall back to localStorage
            const locationData = localStorage.getItem(LOCALSTORAGE_KEY);
            resolve(locationData ? JSON.parse(locationData) : []);
          };
        });
      } else {
        // Fall back to localStorage if IndexedDB is not available
        console.warn('IndexedDB not available, using localStorage fallback');
        const locationData = localStorage.getItem(LOCALSTORAGE_KEY);
        return locationData ? JSON.parse(locationData) : [];
      }
    } catch (error) {
      console.error('Complete storage failure:', error);
      return [];
    }
  },

  // Get user preferences from localStorage
  getUserPreferences: (): Promise<UserPreferences> => {
    try {
      // Use Promise to match the API pattern of other methods
      return new Promise((resolve) => {
        const storedPrefs = localStorage.getItem(PREFERENCES_KEY);
        
        if (storedPrefs) {
          try {
            // Parse stored preferences
            const prefs = JSON.parse(storedPrefs);
            // Merge with defaults in case there are missing properties
            const mergedPrefs = { ...DEFAULT_PREFERENCES, ...prefs };
            resolve(mergedPrefs);
          } catch (error) {
            console.error('Error parsing user preferences:', error);
            resolve(DEFAULT_PREFERENCES);
          }
        } else {
          // If no preferences exist, return defaults
          resolve(DEFAULT_PREFERENCES);
        }
      });
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return Promise.resolve(DEFAULT_PREFERENCES);
    }
  },
}; 