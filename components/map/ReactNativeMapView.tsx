/**
 * ReactNativeMapView Component
 * 
 * Map component using react-native-maps (native maps)
 * Replaces WebView-based MapLibre implementation
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { ActivityIndicator, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ReactNativeMapViewProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  onMapClick?: (lng: number, lat: number) => void;
  onRouteCalculated?: (distance: number, duration: number) => void;
  fromLocation?: { lat: number; lng: number; description?: string } | null;
  toLocation?: { lat: number; lng: number; description?: string } | null;
  userLocation?: { lat: number; lng: number } | null;
  style?: any;
}

const ReactNativeMapView: React.FC<ReactNativeMapViewProps> = ({
  center = [77.2090, 28.6139], // Default to Delhi [lng, lat]
  zoom = 14,
  onMapClick,
  onRouteCalculated,
  fromLocation,
  toLocation,
  userLocation,
  style,
}) => {
  const mapRef = useRef<MapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);

  // Convert center [lng, lat] to Region
  // Use userLocation if available, otherwise use center prop
  const initialRegion: Region = userLocation ? {
    latitude: userLocation.lat,
    longitude: userLocation.lng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : {
    latitude: center[1],
    longitude: center[0],
    latitudeDelta: 0.01 * (18 - zoom),
    longitudeDelta: 0.01 * (18 - zoom),
  };

  // Calculate route when from and to locations are available
  useEffect(() => {
    if (fromLocation && toLocation && fromLocation.lat && fromLocation.lng && toLocation.lat && toLocation.lng) {
      console.log('🔄 Route calculation triggered by location change');
      calculateRoute(fromLocation, toLocation);
    } else {
      // Only clear if both are null/undefined, not if one is missing
      if (!fromLocation && !toLocation) {
        setRouteCoordinates([]);
        setRouteDistance(null);
        setRouteDuration(null);
      }
    }
  }, [fromLocation?.lat, fromLocation?.lng, toLocation?.lat, toLocation?.lng]);

  // Update map region when user location changes (including initial load)
  useEffect(() => {
    if (userLocation && mapRef.current) {
      if (isMapReady) {
        // Map is ready, animate to location
        mapRef.current.animateToRegion({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
      } else {
        // Map not ready yet, will center on initial load via initialRegion
        console.log('📍 Waiting for map to be ready, will center on user location');
      }
    }
  }, [userLocation, isMapReady]);

  // Calculate route using OSRM
  const calculateRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    try {
      console.log('🗺️ Calculating route from:', start, 'to:', end);
      
      // Clear previous route
      setRouteCoordinates([]);
      setRouteDistance(null);
      setRouteDuration(null);
      
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
      
      console.log('🌐 Fetching route from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const geometry = route.geometry;

        // Convert GeoJSON coordinates to {latitude, longitude} format
        const coordinates = geometry.coordinates.map((coord: [number, number]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        console.log('✅ Route calculated:', coordinates.length, 'points');
        setRouteCoordinates(coordinates);
        
        const distance = route.distance / 1000; // km
        const duration = route.duration / 60; // minutes
        
        setRouteDistance(distance);
        setRouteDuration(duration);

        console.log('📊 Route distance:', distance.toFixed(2), 'km, duration:', duration.toFixed(0), 'min');

        if (onRouteCalculated) {
          onRouteCalculated(distance, duration);
        }

        // Fit map to show entire route
        if (mapRef.current && coordinates.length > 0) {
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
              });
            }
          }, 100);
        }
      } else {
        console.error('❌ Route calculation failed:', data.code, data.message);
      }
    } catch (error) {
      console.error('❌ Route calculation error:', error);
      // Reset route state on error
      setRouteCoordinates([]);
      setRouteDistance(null);
      setRouteDuration(null);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    if (onMapClick) {
      onMapClick(longitude, latitude);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false} // We'll use custom markers
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        pitchEnabled={false}
        onPress={handleMapPress}
        onMapReady={() => {
          console.log('✅ React Native Map is ready!');
          setIsMapReady(true);
        }}
      >
        {/* User Location Marker (Blue) */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            }}
            title="Your Location"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userMarker}>
              <MaterialCommunityIcons name="map-marker" size={32} color="#4285F4" />
            </View>
          </Marker>
        )}

        {/* From Location Marker (Green) */}
        {fromLocation && (
          <Marker
            coordinate={{
              latitude: fromLocation.lat,
              longitude: fromLocation.lng,
            }}
            title="From"
            description={fromLocation.description}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.fromMarker}>
              <MaterialCommunityIcons name="map-marker" size={32} color="#10B981" />
            </View>
          </Marker>
        )}

        {/* To Location Marker (Red) */}
        {toLocation && (
          <Marker
            coordinate={{
              latitude: toLocation.lat,
              longitude: toLocation.lng,
            }}
            title="To"
            description={toLocation.description}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.toMarker}>
              <MaterialCommunityIcons name="map-marker" size={32} color="#EF4444" />
            </View>
          </Marker>
        )}

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={5}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    color: '#ED8902',
    fontSize: 14,
    fontWeight: '600',
  },
  userMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fromMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ReactNativeMapView;

