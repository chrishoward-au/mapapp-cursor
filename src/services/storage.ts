import { Location } from '../types';

const DB_NAME = 'mapAppDB';
const DB_VERSION = 1;
const LOCATIONS_STORE = 'locations';
const LOCALSTORAGE_KEY = 'mapApp.locations.fallback';

/**
 * Storage service with IndexedDB as primary storage and localStorage as fallback
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
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([LOCATIONS_STORE], 'readonly');
        const store = transaction.objectStore(LOCATIONS_STORE);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const locations = request.result;
          db.close();
          resolve(locations);
        };
        
        request.onerror = (event) => {
          console.error('GetAll error:', event);
          // Try localStorage fallback
          try {
            const data = localStorage.getItem(LOCALSTORAGE_KEY);
            resolve(data ? JSON.parse(data) : []);
          } catch (e) {
            resolve([]);
          }
        };
      });
    } catch (error) {
      console.error('IndexedDB get error:', error);
      // Fallback to localStorage
      try {
        const data = localStorage.getItem(LOCALSTORAGE_KEY);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        console.error('Complete storage failure:', e);
        return [];
      }
    }
  }
}; 