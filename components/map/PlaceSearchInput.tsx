/**
 * PlaceSearchInput Component
 * 
 * Search input with autocomplete for places using Ola Maps
 */

import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { TextInput, Text, Surface, ActivityIndicator, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePlaceSearch } from '@/app/lib/hooks/useOlaMaps';
import { debounce } from '@/app/utils/helper';

export interface PlaceSearchInputProps {
  placeholder?: string;
  onPlaceSelected: (placeId: string, description: string) => void;
  icon?: string;
  style?: any;
}

export const PlaceSearchInput: React.FC<PlaceSearchInputProps> = ({
  placeholder = 'Search for a place...',
  onPlaceSelected,
  icon = 'map-marker',
  style,
}) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { results, loading, search, clearResults } = usePlaceSearch();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      search(text);
    }, 500),
    []
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    setShowResults(true);
    
    if (text.length >= 2) {
      debouncedSearch(text);
    } else {
      clearResults();
    }
  };

  const handlePlaceSelect = (placeId: string, description: string) => {
    setQuery(description);
    setShowResults(false);
    clearResults();
    onPlaceSelected(placeId, description);
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
    clearResults();
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        mode="outlined"
        value={query}
        onChangeText={handleQueryChange}
        placeholder={placeholder}
        left={<TextInput.Icon icon={icon} />}
        right={
          query ? (
            <TextInput.Icon icon="close" onPress={handleClear} />
          ) : loading ? (
            <TextInput.Icon icon={() => <ActivityIndicator size={20} />} />
          ) : undefined
        }
        style={styles.input}
      />

      {showResults && results && results.predictions.length > 0 && (
        <Surface style={styles.resultsContainer} elevation={4}>
          <FlatList
            data={results.predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <>
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handlePlaceSelect(item.place_id, item.description)}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color="#666"
                    style={styles.resultIcon}
                  />
                  <View style={styles.resultText}>
                    <Text variant="bodyMedium" style={styles.mainText}>
                      {item.structured_formatting.main_text}
                    </Text>
                    <Text variant="bodySmall" style={styles.secondaryText}>
                      {item.structured_formatting.secondary_text}
                    </Text>
                  </View>
                </TouchableOpacity>
                <Divider />
              </>
            )}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        </Surface>
      )}

      {showResults && query.length >= 2 && results && results.predictions.length === 0 && !loading && (
        <Surface style={styles.resultsContainer} elevation={4}>
          <View style={styles.noResults}>
            <MaterialCommunityIcons name="map-marker-off" size={40} color="#999" />
            <Text style={styles.noResultsText}>No places found</Text>
          </View>
        </Surface>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  input: {
    backgroundColor: 'white',
  },
  resultsContainer: {
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 300,
    overflow: 'hidden',
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultText: {
    flex: 1,
  },
  mainText: {
    color: '#333',
    fontWeight: '500',
  },
  secondaryText: {
    color: '#666',
    marginTop: 2,
  },
  noResults: {
    padding: 32,
    alignItems: 'center',
  },
  noResultsText: {
    marginTop: 8,
    color: '#999',
  },
});

export default PlaceSearchInput;

