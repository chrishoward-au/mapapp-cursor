import { Location, UserPreferences } from '../types';
import { supabase } from './supabaseClient'; // Import the Supabase client

const PREFERENCES_KEY = 'mapApp.preferences';
const DEFAULT_PREFERENCES: UserPreferences = {
  defaultMapLayer: 'map',
  defaultCenter: [-0.118092, 51.509865], // London as default
  defaultZoom: 12,
  weatherLayerEnabled: false
};

/**
 * Storage service using Supabase
 */
export const storageService = {
  /**
   * Get locations from Supabase for the logged-in user (assumes RLS is set up)
   */
  async getLocations(): Promise<Location[]> {
    try {
      // Select only the columns corresponding to the Location type for now
      const { data, error } = await supabase
        .from('map_points')
        .select('id, name, latitude, longitude, created_at, updated_at'); // Ensure column names match DB

      if (error) {
        console.error('Error fetching locations:', error);
        throw error; // Re-throw the error to be handled by the caller
      }

      // Map Supabase rows to Location objects
      const locations: Location[] = data?.map(point => ({
        id: point.id,
        name: point.name,
        // Map latitude/longitude back to coordinates array [lng, lat]
        coordinates: [point.longitude, point.latitude],
        createdAt: point.created_at,
        updatedAt: point.updated_at,
      })) || [];

      return locations;

    } catch (error) {
      console.error('Supabase getLocations error:', error);
      return []; // Return empty array on failure
    }
  },

  /**
   * Add a location to Supabase. Assumes RLS handles user_id.
   * Lets DB generate id and created_at.
   * @returns The newly created Location object from the database.
   */
  async addLocation(name: string, coordinates: [number, number]): Promise<Location> {
    try {
      const newPointData = {
        name: name,
        longitude: coordinates[0],
        latitude: coordinates[1],
        // user_id is assumed handled by RLS/auth context
        // created_at uses default now()
        // other fields use DB defaults or are nullable
      };

      const { data, error } = await supabase
        .from('map_points')
        .insert(newPointData)
        .select('id, name, latitude, longitude, created_at, updated_at') // Select the data back
        .single(); // Expecting a single row back

      if (error) {
        console.error('Error adding location:', error);
        throw error;
      }

      if (!data) {
         throw new Error("Failed to add location: No data returned.");
      }

      // Map the returned database row back to the Location type
      const newLocation: Location = {
         id: data.id,
         name: data.name,
         coordinates: [data.longitude, data.latitude],
         createdAt: data.created_at,
         updatedAt: data.updated_at,
      };

      return newLocation;

    } catch (error) {
      console.error('Supabase addLocation error:', error);
      // Re-throw the error so the context can handle UI feedback
      throw new Error(`Failed to add location: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Delete a location from Supabase by its ID.
   */
  async deleteLocation(locationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('map_points')
        .delete()
        .match({ id: locationId });

      if (error) {
        console.error('Error deleting location:', error);
        throw error;
      }
      // No return value needed for delete
    } catch (error) {
      console.error('Supabase deleteLocation error:', error);
      throw new Error(`Failed to delete location: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  // === Keep Preferences code using localStorage ===
  getUserPreferences: async (): Promise<UserPreferences> => {
     // Note: Made async to potentially align APIs later if prefs move to DB
     try {
       return new Promise((resolve) => {
         const storedPrefs = localStorage.getItem(PREFERENCES_KEY);
         if (storedPrefs) {
           try {
             const prefs = JSON.parse(storedPrefs);
             const mergedPrefs = { ...DEFAULT_PREFERENCES, ...prefs };
             resolve(mergedPrefs);
           } catch (error) {
             console.error('Error parsing user preferences:', error);
             resolve(DEFAULT_PREFERENCES);
           }
         } else {
           resolve(DEFAULT_PREFERENCES);
         }
       });
     } catch (error) {
       console.error('Error getting user preferences:', error);
       return Promise.resolve(DEFAULT_PREFERENCES);
     }
   },

   saveUserPreferences: async (prefs: UserPreferences): Promise<void> => {
      // Added save function for completeness, also async
      try {
         localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
         return Promise.resolve();
      } catch (error) {
         console.error('Error saving user preferences:', error);
         return Promise.reject(error);
      }
   }
   // === End Preferences code ===
};

// Define UserPreferences type if not already globally defined
// Adjust path if your types file is different
// import { UserPreferences } from '../types'; // <-- REMOVE THIS DUPLICATE IMPORT

// Remove old IndexedDB related code
// const DB_NAME = 'mapAppDB';
// const DB_VERSION = 1;
// const LOCATIONS_STORE = 'locations';
// const LOCALSTORAGE_KEY = 'mapApp.locations.fallback';
// functions initDB(), old saveLocations(), old getLocations() are removed.

// const DB_NAME = 'mapAppDB';
// const DB_VERSION = 1;
// const LOCATIONS_STORE = 'locations';
// const LOCALSTORAGE_KEY = 'mapApp.locations.fallback';
// const PREFERENCES_KEY = 'mapApp.preferences';
// const DEFAULT_PREFERENCES: UserPreferences = {
//   defaultMapLayer: 'map',
//   defaultCenter: [-0.118092, 51.509865], // London as default
//   defaultZoom: 12,
//   weatherLayerEnabled: false
// };

// /**
//  * Storage service with fallback to localStorage if IndexedDB is not available
//  */
// export const storageService = {
//   /**
//    * Initialize the database
//    */
//   async initDB(): Promise<IDBDatabase> {
//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open(DB_NAME, DB_VERSION);
//       
//       request.onerror = (event) => {
//         console.error('IndexedDB error:', event);
//         reject('Failed to open IndexedDB');
//       };
//       
//       request.onsuccess = (event) => {
//         const db = (event.target as IDBOpenDBRequest).result;
//         resolve(db);
//       };
//       
//       request.onupgradeneeded = (event) => {
//         const db = (event.target as IDBOpenDBRequest).result;
//         // Create the locations object store if it doesn't exist
//         if (!db.objectStoreNames.contains(LOCATIONS_STORE)) {
//           db.createObjectStore(LOCATIONS_STORE, { keyPath: 'id' });
//         }
//       };
//     });
//   },
//
//   /**
//    * Save locations to storage (IndexedDB with localStorage fallback)
//    */
//   async saveLocations(locations: Location[]): Promise<void> {
//     try {
//       const db = await this.initDB();
//       
//       return new Promise((resolve, reject) => {
//         const transaction = db.transaction([LOCATIONS_STORE], 'readwrite');
//         const store = transaction.objectStore(LOCATIONS_STORE);
//         
//         // Clear all existing locations
//         const clearRequest = store.clear();
//         
//         clearRequest.onsuccess = () => {
//           // Add all new locations
//           locations.forEach(location => {
//             store.add(location);
//           });
//         };
//         
//         transaction.oncomplete = () => {
//           // Also save to localStorage as a fallback
//           try {
//             localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(locations));
//           } catch (e) {
//             console.warn('Unable to save to localStorage fallback:', e);
//           }
//           db.close();
//           resolve();
//         };
//         
//         transaction.onerror = (event) => {
//           console.error('Transaction error:', event);
//           // Try localStorage fallback
//           try {
//             localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(locations));
//             resolve();
//           } catch (e) {
//             reject('Failed to save locations: ' + e);
//           }
//         };
//       });
//     } catch (error) {
//       console.error('IndexedDB save error:', error);
//       // Fallback to localStorage
//       try {
//         localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(locations));
//       } catch (e) {
//         console.error('Complete storage failure:', e);
//       }
//     }
//   },
//
//   /**
//    * Get locations from storage (IndexedDB with localStorage fallback)
//    */
//   async getLocations(): Promise<Location[]> {
//     try {
//       const db = await this.initDB();
//       
//       // Try to get locations from IndexedDB first
//       if (db) {
//         return new Promise((resolve) => {
//           const transaction = db.transaction([LOCATIONS_STORE], 'readonly');
//           const store = transaction.objectStore(LOCATIONS_STORE);
//           const request = store.getAll();
//           
//           request.onsuccess = () => {
//             const locations = request.result;
//             db.close();
//             resolve(locations);
//           };
//           
//           request.onerror = () => {
//             console.warn('Error fetching from IndexedDB, falling back to localStorage');
//             // Fall back to localStorage
//             const locationData = localStorage.getItem(LOCALSTORAGE_KEY);
//             resolve(locationData ? JSON.parse(locationData) : []);
//           };
//         });
//       } else {
//         // Fall back to localStorage if IndexedDB is not available
//         console.warn('IndexedDB not available, using localStorage fallback');
//         const locationData = localStorage.getItem(LOCALSTORAGE_KEY);
//         return locationData ? JSON.parse(locationData) : [];
//       }
//     } catch (error) {
//       console.error('Complete storage failure:', error);
//       return [];
//     }
//   },
//
//   // Get user preferences from localStorage
//   getUserPreferences: (): Promise<UserPreferences> => {
//     try {
//       // Use Promise to match the API pattern of other methods
//       return new Promise((resolve) => {
//         const storedPrefs = localStorage.getItem(PREFERENCES_KEY);
//         
//         if (storedPrefs) {
//           try {
//             // Parse stored preferences
//             const prefs = JSON.parse(storedPrefs);
//             // Merge with defaults in case there are missing properties
//             const mergedPrefs = { ...DEFAULT_PREFERENCES, ...prefs };
//             resolve(mergedPrefs);
//           } catch (error) {
//             console.error('Error parsing user preferences:', error);
//             resolve(DEFAULT_PREFERENCES);
//           }
//         } else {
//           // If no preferences exist, return defaults
//           resolve(DEFAULT_PREFERENCES);
//         }
//       });
//     } catch (error) {
//       console.error('Error getting user preferences:', error);
//       return Promise.resolve(DEFAULT_PREFERENCES);
//     }
//   },
// }; 