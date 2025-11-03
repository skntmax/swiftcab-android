/**
 * Ola Maps API Integration
 * Documentation: https://maps.olakrutrim.com/docs
 * 
 * This service provides access to Ola Maps APIs including:
 * - Geocoding & Reverse Geocoding
 * - Directions & Distance Matrix
 * - Places Search & Autocomplete
 * - Route Optimization
 */

import { all_env } from '@/app/utils/env';

// ==================== TYPES ====================

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface PlaceAutocompleteRequest {
  input: string;
  location?: string; // "lat,lng"
  radius?: number;
  strictbounds?: boolean;
  language?: string;
}

export interface PlaceAutocompleteResult {
  predictions: Array<{
    description: string;
    place_id: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  }>;
  status: string;
}

export interface DirectionsRequest {
  origin: string; // "lat,lng"
  destination: string; // "lat,lng"
  waypoints?: string; // "lat,lng|lat,lng"
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
  alternatives?: boolean;
  avoid?: 'tolls' | 'highways' | 'ferries';
  traffic_model?: 'best_guess' | 'optimistic' | 'pessimistic';
}

export interface DirectionsResponse {
  routes: Array<{
    summary: string;
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      start_location: { lat: number; lng: number };
      end_location: { lat: number; lng: number };
      steps: Array<{
        distance: { text: string; value: number };
        duration: { text: string; value: number };
        html_instructions: string;
        polyline: { points: string };
        start_location: { lat: number; lng: number };
        end_location: { lat: number; lng: number };
      }>;
    }>;
    overview_polyline: { points: string };
    bounds: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  }>;
  status: string;
}

export interface GeocodeRequest {
  address: string;
  language?: string;
}

export interface ReverseGeocodeRequest {
  latlng: string; // "lat,lng"
  language?: string;
}

export interface GeocodeResponse {
  results: Array<{
    formatted_address: string;
    geometry: {
      location: { lat: number; lng: number };
      location_type: string;
    };
    place_id: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
  status: string;
}

export interface PlacesNearbyRequest {
  location: string; // "lat,lng"
  radius: number;
  type?: string;
  keyword?: string;
}

export interface DistanceMatrixRequest {
  origins: string; // "lat,lng|lat,lng"
  destinations: string; // "lat,lng|lat,lng"
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

// ==================== API CLIENT ====================

class OlaMapsAPI {
  private baseURL: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.baseURL = all_env.OLA_API_URL;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetchWithAuth(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    await this.ensureValidToken();

    const url = new URL(endpoint, this.baseURL);
    url.searchParams.append('api_key', all_env.OLA_MAP_KEY);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url.toString(), {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, refresh and retry
          this.accessToken = null;
          await this.ensureValidToken();
          return this.fetchWithAuth(endpoint, options);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Ola Maps API Error:', error);
      throw error;
    }
  }

  /**
   * Ensures we have a valid OAuth token
   * Reference: https://maps.olakrutrim.com/docs/authentication
   */
  private async ensureValidToken(): Promise<void> {
    const now = Date.now();
    
    // Check if token is still valid (with 5 minute buffer)
    if (this.accessToken && this.tokenExpiry > now + 5 * 60 * 1000) {
      return;
    }

    try {
      // Get OAuth token
      const response = await fetch(`${all_env.OLA_API_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: all_env.OLA_CLIENT_ID,
          client_secret: all_env.OLA_CLIENT_SECRET,
          scope: 'maps:read',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get OAuth token: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Set expiry (usually expires_in is in seconds)
      this.tokenExpiry = now + (data.expires_in || 3600) * 1000;
    } catch (error) {
      console.error('Failed to get Ola Maps access token:', error);
      throw error;
    }
  }

  // ==================== GEOCODING API ====================

  /**
   * Geocode an address to coordinates
   * Reference: https://maps.olakrutrim.com/docs/geocoding-api
   */
  async geocode(params: GeocodeRequest): Promise<GeocodeResponse> {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.fetchWithAuth(`/v1/geocode?${queryParams}`);
  }

  /**
   * Reverse geocode coordinates to address
   * Reference: https://maps.olakrutrim.com/docs/reverse-geocoding-api
   */
  async reverseGeocode(params: ReverseGeocodeRequest): Promise<GeocodeResponse> {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.fetchWithAuth(`/v1/reverse-geocode?${queryParams}`);
  }

  // ==================== DIRECTIONS API ====================

  /**
   * Get directions between two points
   * Reference: https://maps.olakrutrim.com/docs/directions-api
   */
  async getDirections(params: DirectionsRequest): Promise<DirectionsResponse> {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.fetchWithAuth(`/v1/directions?${queryParams}`);
  }

  /**
   * Get distance and time between multiple origins and destinations
   * Reference: https://maps.olakrutrim.com/docs/distance-matrix-api
   */
  async getDistanceMatrix(params: DistanceMatrixRequest): Promise<any> {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.fetchWithAuth(`/v1/distancematrix?${queryParams}`);
  }

  // ==================== PLACES API ====================

  /**
   * Autocomplete place search
   * Reference: https://maps.olakrutrim.com/docs/autocomplete-api
   */
  async autocomplete(params: PlaceAutocompleteRequest): Promise<PlaceAutocompleteResult> {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.fetchWithAuth(`/v1/autocomplete?${queryParams}`);
  }

  /**
   * Get place details by place ID
   * Reference: https://maps.olakrutrim.com/docs/place-details-api
   */
  async getPlaceDetails(placeId: string): Promise<any> {
    return this.fetchWithAuth(`/v1/place-details?place_id=${placeId}`);
  }

  /**
   * Search for nearby places
   * Reference: https://maps.olakrutrim.com/docs/nearby-search-api
   */
  async nearbySearch(params: PlacesNearbyRequest): Promise<any> {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.fetchWithAuth(`/v1/nearby-search?${queryParams}`);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Format coordinates as string for API
   */
  formatLatLng(lat: number, lng: number): string {
    return `${lat},${lng}`;
  }

  /**
   * Decode polyline string to coordinates
   */
  decodePolyline(encoded: string): Array<{ latitude: number; longitude: number }> {
    const poly: Array<{ latitude: number; longitude: number }> = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b: number;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return poly;
  }
}

// Export singleton instance
export const olaMapsAPI = new OlaMapsAPI();
export default olaMapsAPI;

