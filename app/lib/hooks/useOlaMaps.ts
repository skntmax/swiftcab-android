/**
 * Custom hooks for Ola Maps integration
 */

import { useState, useEffect, useCallback } from 'react';
import olaMapsAPI, {
  LatLng,
  DirectionsResponse,
  PlaceAutocompleteResult,
  GeocodeResponse,
} from '../api/olaMapsApi';
import * as Location from 'expo-location';

// ==================== USE CURRENT LOCATION ====================

export interface UseCurrentLocationResult {
  location: LatLng | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
}

export const useCurrentLocation = (): UseCurrentLocationResult => {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, []);

  return { location, loading, error, refreshLocation };
};

// ==================== USE DIRECTIONS ====================

export interface UseDirectionsResult {
  directions: DirectionsResponse | null;
  loading: boolean;
  error: string | null;
  getDirections: (origin: LatLng, destination: LatLng) => Promise<void>;
  route: Array<{ latitude: number; longitude: number }> | null;
  distance: string | null;
  duration: string | null;
}

export const useDirections = (): UseDirectionsResult => {
  const [directions, setDirections] = useState<DirectionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<Array<{ latitude: number; longitude: number }> | null>(null);

  const getDirections = useCallback(async (origin: LatLng, destination: LatLng) => {
    try {
      setLoading(true);
      setError(null);

      const result = await olaMapsAPI.getDirections({
        origin: olaMapsAPI.formatLatLng(origin.latitude, origin.longitude),
        destination: olaMapsAPI.formatLatLng(destination.latitude, destination.longitude),
        mode: 'driving',
        alternatives: false,
      });

      setDirections(result);

      // Decode polyline for route display
      if (result.routes && result.routes.length > 0) {
        const polyline = result.routes[0].overview_polyline.points;
        const decodedRoute = olaMapsAPI.decodePolyline(polyline);
        setRoute(decodedRoute);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get directions');
      setDirections(null);
      setRoute(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const distance = directions?.routes[0]?.legs[0]?.distance?.text || null;
  const duration = directions?.routes[0]?.legs[0]?.duration?.text || null;

  return { directions, loading, error, getDirections, route, distance, duration };
};

// ==================== USE PLACE SEARCH ====================

export interface UsePlaceSearchResult {
  results: PlaceAutocompleteResult | null;
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

export const usePlaceSearch = (): UsePlaceSearchResult => {
  const [results, setResults] = useState<PlaceAutocompleteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await olaMapsAPI.autocomplete({
        input: query,
        language: 'en',
      });

      setResults(result);
    } catch (err: any) {
      setError(err.message || 'Failed to search places');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return { results, loading, error, search, clearResults };
};

// ==================== USE GEOCODING ====================

export interface UseGeocodingResult {
  geocode: (address: string) => Promise<LatLng | null>;
  reverseGeocode: (lat: number, lng: number) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export const useGeocoding = (): UseGeocodingResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(async (address: string): Promise<LatLng | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await olaMapsAPI.geocode({ address });

      if (result.results && result.results.length > 0) {
        const location = result.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      }

      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to geocode address');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await olaMapsAPI.reverseGeocode({
        latlng: olaMapsAPI.formatLatLng(lat, lng),
      });

      if (result.results && result.results.length > 0) {
        return result.results[0].formatted_address;
      }

      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to reverse geocode');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { geocode, reverseGeocode, loading, error };
};

// ==================== USE NEARBY SEARCH ====================

export interface UseNearbySearchResult {
  results: any[] | null;
  loading: boolean;
  error: string | null;
  search: (location: LatLng, radius: number, type?: string) => Promise<void>;
  clearResults: () => void;
}

export const useNearbySearch = (): UseNearbySearchResult => {
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (location: LatLng, radius: number, type?: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await olaMapsAPI.nearbySearch({
        location: olaMapsAPI.formatLatLng(location.latitude, location.longitude),
        radius,
        type,
      });

      setResults(result.results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search nearby places');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return { results, loading, error, search, clearResults };
};

export default {
  useCurrentLocation,
  useDirections,
  usePlaceSearch,
  useGeocoding,
  useNearbySearch,
};

