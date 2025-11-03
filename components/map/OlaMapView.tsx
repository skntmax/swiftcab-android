/**
 * OlaMapView Component
 * 
 * A reusable map component powered by Ola Maps
 * Uses react-native-maps with custom styling
 */

import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region, MapMarker } from 'react-native-maps';
import { ActivityIndicator, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface OlaMapViewProps {
  initialRegion?: Region;
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

const DEFAULT_REGION: Region = {
  latitude: 19.0760, // Mumbai coordinates as default
  longitude: 72.8777,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const OlaMapView: React.FC<OlaMapViewProps> = ({
  initialRegion = DEFAULT_REGION,
  markers = [],
  route,
  onMapPress,
  onMarkerPress,
  showUserLocation = true,
  followUserLocation = false,
  style,
  zoomEnabled = true,
  scrollEnabled = true,
  rotateEnabled = true,
  pitchEnabled = true,
}) => {
  const mapRef = useRef<MapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (isMapReady && followUserLocation && showUserLocation) {
      // Center on user location when available
      mapRef.current?.animateToRegion(initialRegion, 1000);
    }
  }, [followUserLocation, showUserLocation, initialRegion, isMapReady]);

  useEffect(() => {
    if (isMapReady && markers.length > 0 && mapRef.current) {
      // Fit all markers in view
      const coordinates = markers.map(m => m.coordinate);
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [markers, isMapReady]);

  const handleMapPress = (event: any) => {
    if (onMapPress) {
      onMapPress(event.nativeEvent.coordinate);
    }
  };

  const handleMarkerPress = (markerId: string) => {
    if (onMarkerPress) {
      onMarkerPress(markerId);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={showUserLocation}
        followsUserLocation={followUserLocation}
        showsCompass={true}
        showsScale={true}
        showsTraffic={false}
        zoomEnabled={zoomEnabled}
        scrollEnabled={scrollEnabled}
        rotateEnabled={rotateEnabled}
        pitchEnabled={pitchEnabled}
        onPress={handleMapPress}
        onMapReady={() => setIsMapReady(true)}
        customMapStyle={OLA_MAP_STYLE}
      >
        {/* Render markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={() => handleMarkerPress(marker.id)}
            pinColor={marker.color || '#ED8902'}
          >
            {marker.icon && (
              <View style={styles.customMarker}>
                <MaterialCommunityIcons
                  name={marker.icon as any}
                  size={30}
                  color={marker.color || '#ED8902'}
                />
              </View>
            )}
          </Marker>
        ))}

        {/* Render route polyline */}
        {route && route.length > 1 && (
          <Polyline
            coordinates={route}
            strokeWidth={4}
            strokeColor="#ED8902"
            lineDashPattern={[0]}
          />
        )}
      </MapView>

      {!isMapReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ED8902" />
          <Text style={styles.loadingText}>Loading Map...</Text>
        </View>
      )}
    </View>
  );
};

// Custom map style (can be customized based on Ola Maps branding)
const OLA_MAP_STYLE = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ED8902',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 220, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default OlaMapView;

