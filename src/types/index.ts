export interface Location {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  startLocation: Location;
  endLocation: Location;
  distance: number;
  duration: number;
  createdAt: string;
}

export interface UserPreferences {
  defaultMapLayer: 'map' | 'satellite';
  defaultCenter: [number, number];
  defaultZoom: number;
  weatherLayerEnabled: boolean;
} 