/**
 * SearchModal Component
 * 
 * Full-screen search interface for selecting From/To locations
 */

import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PlaceSearchInput from '@/components/map/PlaceSearchInput';

interface SearchHistoryItem {
  placeId: string;
  description: string;
  lat?: number;
  lng?: number;
  timestamp: Date;
}

interface SearchModalProps {
  title: string;
  placeholder: string;
  onPlaceSelected: (placeId: string, description: string, lat?: number, lng?: number) => void;
  onClose: () => void;
  icon?: string;
  searchHistory?: SearchHistoryItem[];
}

const THEME = {
  primary: '#ED8902',
  text: '#000000',
  textSecondary: '#666666',
  surface: '#F5F5F5',
  border: '#E0E0E0',
};

const SearchModal: React.FC<SearchModalProps> = ({
  title,
  placeholder,
  onPlaceSelected,
  onClose,
  icon = 'map-marker',
  searchHistory = [],
}) => {
  const handlePlaceSelect = (placeId: string, description: string, lat?: number, lng?: number) => {
    onPlaceSelected(placeId, description, lat, lng);
    onClose();
  };

  const handleHistoryItemPress = (item: SearchHistoryItem) => {
    handlePlaceSelect(item.placeId, item.description, item.lat, item.lng);
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.title}>{title}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <PlaceSearchInput
          placeholder={placeholder}
          onPlaceSelected={handlePlaceSelect}
          icon={icon}
          style={styles.searchInput}
        />
      </View>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Text variant="titleSmall" style={styles.historyTitle}>Recent Searches</Text>
          <FlatList
            data={searchHistory}
            keyExtractor={(item) => item.placeId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.historyItem}
                onPress={() => handleHistoryItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.historyIconContainer}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={THEME.primary} />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyText}>{item.description}</Text>
                  <Text style={styles.historyTime}>{formatTime(item.timestamp)}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={THEME.textSecondary} />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontWeight: '700',
    color: THEME.text,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  searchInput: {
    marginBottom: 8,
  },
  historyContainer: {
    flex: 1,
    padding: 16,
  },
  historyTitle: {
    color: THEME.text,
    fontWeight: '700',
    marginBottom: 12,
    fontSize: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: THEME.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  historyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyText: {
    color: THEME.text,
    fontSize: 15,
    fontWeight: '500',
  },
  historyTime: {
    color: THEME.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});

export default SearchModal;

