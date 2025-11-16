/**
 * Live Ola Map View with Location Tracking and Directional Arrow
 * Using react-native-maps with Ola Maps APIs
 */

import { all_env } from '@/app/utils/env';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Text } from 'react-native-paper';

interface LiveOlaMapViewProps {
  currentLocation?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  onDistanceCalculated?: (distance: number) => void;
}

interface LocationData {
  lat: number;
  lng: number;
  heading: number; // Direction the device is facing (0-360 degrees)
  accuracy: number;
}

export const LiveOlaMapView: React.FC<LiveOlaMapViewProps> = ({
  currentLocation: externalLocation,
  destination,
  onDistanceCalculated,
}) => {
  const mapRef = useRef<MapView>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // Start live location tracking with heading
  useEffect(() => {
    let isMounted = true;

    const startLocationTracking = async () => {
      try {
        setIsLoading(true);
        
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setError('Location permission denied');
          setIsLoading(false);
          return;
        }

        // Get initial location
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });

        if (isMounted) {
          setLocationData({
            lat: initialLocation.coords.latitude,
            lng: initialLocation.coords.longitude,
            heading: initialLocation.coords.heading || 0,
            accuracy: initialLocation.coords.accuracy || 0,
          });
          setIsLoading(false);
        }

        // Subscribe to location updates with heading
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000, // Update every second
            distanceInterval: 1, // Update every meter
          },
          (location) => {
            if (isMounted) {
              const newLocationData: LocationData = {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                heading: location.coords.heading || 0, // Direction device is facing
                accuracy: location.coords.accuracy || 0,
              };
              setLocationData(newLocationData);
            }
          }
        );
      } catch (err: any) {
        console.error('Location tracking error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to track location');
          setIsLoading(false);
        }
      }
    };

    startLocationTracking();

    return () => {
      isMounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  // Fetch route from Ola Maps API when destination changes
  useEffect(() => {
    if (!locationData || !destination) {
      setRouteCoords([]);
      return;
    }

    const fetchRoute = async () => {
      try {
        const origin = `${locationData.lat},${locationData.lng}`;
        const dest = `${destination.lat},${destination.lng}`;

        const response = await fetch(
          `https://api.olamaps.io/routing/v1/directions?origin=${origin}&destination=${dest}&api_key=${all_env.OLA_MAP_KEY}`
        );

        const data = await response.json();

        if (data.routes && data.routes[0]?.legs) {
          // Extract coordinates from the route
          const coords: Array<{ latitude: number; longitude: number }> = [];
          
          data.routes[0].legs.forEach((leg: any) => {
            leg.steps?.forEach((step: any) => {
              if (step.polyline?.geoJson?.coordinates) {
                step.polyline.geoJson.coordinates.forEach(([lng, lat]: [number, number]) => {
                  coords.push({ latitude: lat, longitude: lng });
                });
              }
            });
          });

          setRouteCoords(coords);

          // Calculate distance
          const distanceKm = data.routes[0].legs.reduce(
            (sum: number, leg: any) => sum + (leg.distance || 0),
            0
          ) / 1000;

          if (onDistanceCalculated) {
            onDistanceCalculated(distanceKm);
          }
        }
      } catch (error) {
        console.error('Error fetching route from Ola Maps:', error);
      }
    };

    fetchRoute();
  }, [locationData, destination, onDistanceCalculated]);

  // Center map on user location
  useEffect(() => {
    if (mapRef.current && locationData) {
      mapRef.current.animateToRegion(
        {
          latitude: locationData.lat,
          longitude: locationData.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  }, [locationData]);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Text style={styles.errorSubtext}>Please check location permissions in Settings</Text>
        </View>
      </View>
    );
  }

  if (isLoading || !locationData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED8902" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </View>
    );
  }

  const initialRegion: Region = {
    latitude: locationData.lat,
    longitude: locationData.lng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false} // We'll use custom marker
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={false}
        showsTraffic={false}
        rotateEnabled={true}
        pitchEnabled={false}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        {/* Custom directional arrow marker for user location */}
        {locationData && (
          <Marker
            coordinate={{
              latitude: locationData.lat,
              longitude: locationData.lng,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            rotation={locationData.heading} // Rotate based on device heading
            style={{ transform: [{ rotate: `${locationData.heading}deg` }] }}
          >
            <View style={styles.arrowContainer}>
              {/* Green arrow pointing up, will rotate with heading */}
              <MaterialCommunityIcons
                name="navigation"
                size={40}
                color="#10b981"
                style={styles.arrowIcon}
              />
              {/* Pulsing circle effect */}
              <View style={styles.pulseCircle} />
            </View>
          </Marker>
        )}

        {/* Destination marker */}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.lat,
              longitude: destination.lng,
            }}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.destinationMarker}>
              <MaterialCommunityIcons name="map-marker" size={50} color="#ef4444" />
            </View>
          </Marker>
        )}

        {/* Route polyline */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#0ea5e9"
            strokeWidth={4}
            lineJoin="round"
            lineCap="round"
          />
        )}
      </MapView>

      {/* Info overlay */}
      <View style={styles.infoPanel}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 Location:</Text>
          <Text style={styles.infoValue}>
            {locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🧭 Heading:</Text>
          <Text style={styles.infoValue}>{Math.round(locationData.heading)}°</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🎯 Accuracy:</Text>
          <Text style={styles.infoValue}>{Math.round(locationData.accuracy)}m</Text>
        </View>
      </View>

      {/* Recenter button */}
      <View style={styles.recenterButton}>
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={28}
          color="#ED8902"
          onPress={() => {
            if (mapRef.current && locationData) {
              mapRef.current.animateToRegion(
                {
                  latitude: locationData.lat,
                  longitude: locationData.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                500
              );
            }
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  map: {
    flex: 1,
  },
  arrowContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  arrowIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pulseCircle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  destinationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoPanel: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12,
    color: '#000',
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  recenterButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default LiveOlaMapView;
