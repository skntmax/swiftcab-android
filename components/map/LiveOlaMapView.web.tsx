/**
 * Web Fallback for Live Ola Map View
 * Maps are not available on web, mobile-only feature
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';

interface LiveOlaMapViewProps {
  currentLocation?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  drivers?: Array<any>;
  onDistanceCalculated?: (distance: number) => void;
}

export const LiveOlaMapView: React.FC<LiveOlaMapViewProps> = ({
  currentLocation,
}) => {
  return (
    <Surface style={styles.container} elevation={1}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="map-marker-off" size={60} color="#ccc" />
        <Text variant="titleMedium" style={styles.title}>
          Map Available on Mobile Only
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Live location tracking and map features are available on the mobile app.
        </Text>
        
        {currentLocation && (
          <View style={styles.locationInfo}>
            <Text variant="bodySmall" style={styles.locationText}>
              📍 Current Location:
            </Text>
            <Text variant="bodySmall" style={styles.coordinates}>
              {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </Text>
          </View>
        )}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 400,
    width: '100%',
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
    maxWidth: 350,
  },
  title: {
    marginTop: 16,
    color: '#555',
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 8,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
  },
  locationInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  locationText: {
    color: '#0369a1',
    fontWeight: '600',
    marginBottom: 4,
  },
  coordinates: {
    color: '#0284c7',
    fontFamily: 'monospace',
  },
});

export default LiveOlaMapView;

