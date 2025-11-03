/**
 * OlaMapView Component - Web Fallback
 * 
 * A fallback component for web that displays a placeholder
 * since react-native-maps doesn't work on web
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';

export interface OlaMapViewProps {
  initialRegion?: any;
  markers?: Array<{
    id: string;
    coordinate: { latitude: number; longitude: number };
    title?: string;
    description?: string;
    icon?: string;
    color?: string;
  }>;
  route?: Array<{ latitude: number; longitude: number }>;
  onMapPress?: (coordinate: { latitude: number; longitude: number }) => void;
  onMarkerPress?: (markerId: string) => void;
  showUserLocation?: boolean;
  followUserLocation?: boolean;
  style?: any;
  zoomEnabled?: boolean;
  scrollEnabled?: boolean;
  rotateEnabled?: boolean;
  pitchEnabled?: boolean;
}

export const OlaMapView: React.FC<OlaMapViewProps> = ({
  style,
  markers = [],
  initialRegion,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Surface style={styles.surface} elevation={2}>
        <MaterialCommunityIcons name="map-outline" size={64} color="#ED8902" />
        <Text variant="headlineSmall" style={styles.title}>
          Map View (Web)
        </Text>
        <Text variant="bodyMedium" style={styles.message}>
          Map functionality is available on mobile devices.
          {'\n'}Please use the mobile app to view the map.
        </Text>
        {markers.length > 0 && (
          <View style={styles.info}>
            <Text variant="bodySmall" style={styles.infoText}>
              📍 {markers.length} marker{markers.length !== 1 ? 's' : ''} available
            </Text>
          </View>
        )}
        {initialRegion && (
          <View style={styles.info}>
            <Text variant="bodySmall" style={styles.infoText}>
              📌 Location: {initialRegion.latitude.toFixed(4)}, {initialRegion.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      </Surface>
    </View>
  );
};

export default OlaMapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
  },
  surface: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    maxWidth: 400,
    margin: 16,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    color: '#111111',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#666666',
    marginTop: 8,
    lineHeight: 24,
  },
  info: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF8DC',
    borderRadius: 8,
    width: '100%',
  },
  infoText: {
    color: '#111111',
    textAlign: 'center',
  },
});

