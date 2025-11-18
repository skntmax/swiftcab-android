/**
 * Place Search Hook using Photon API (Free, no API key required)
 * Photon is an open-source geocoding service based on OpenStreetMap
 * API: https://photon.komoot.io/
 */

import { useState, useCallback } from 'react';

export interface PlaceSearchResult {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
  lat?: number;
  lng?: number;
}

export interface UsePlaceSearchResult {
  results: PlaceSearchResult[] | null;
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

export const usePlaceSearch = (): UsePlaceSearchResult => {
  const [results, setResults] = useState<PlaceSearchResult[] | null>(null);
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

      // Use Photon API for place search (free, no API key required)
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=en`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform Photon API response to match our interface
      const transformedResults: PlaceSearchResult[] = (data.features || []).map(
        (feature: any, index: number) => {
          const properties = feature.properties || {};
          const coordinates = feature.geometry?.coordinates || [];
          
          // Build description from available properties
          const name = properties.name || '';
          const city = properties.city || properties.locality || '';
          const state = properties.state || '';
          const country = properties.country || '';
          
          let mainText = name || 'Unnamed Place';
          let secondaryText = [city, state, country].filter(Boolean).join(', ') || '';

          // If no name, use the first property available
          if (!name && properties.osm_value) {
            mainText = properties.osm_value;
          }

          return {
            place_id: feature.properties?.osm_id?.toString() || `photon_${index}`,
            description: secondaryText ? `${mainText}, ${secondaryText}` : mainText,
            main_text: mainText,
            secondary_text: secondaryText,
            lat: coordinates[1], // Photon uses [lng, lat] format
            lng: coordinates[0],
          };
        }
      );

      setResults(transformedResults);
    } catch (err: any) {
      console.error('Place search error:', err);
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

export default usePlaceSearch;

