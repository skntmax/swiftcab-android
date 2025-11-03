/**
 * MapDemoScreen - Example screen showing Ola Maps integration
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, Surface, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OlaMapView from '@/components/map/OlaMapView';
import PlaceSearchInput from '@/components/map/PlaceSearchInput';
import { useCurrentLocation, useDirections, useGeocoding } from '@/app/lib/hooks/useOlaMaps';
import olaMapsAPI from '@/app/lib/api/olaMapsApi';
import { CONSTANTS } from '@/app/utils/const';

export default function MapDemoScreen() {
  const { location, loading: locationLoading } = useCurrentLocation();
  const { getDirections, route, distance, duration, loading: directionsLoading } = useDirections();
  const { geocode, reverseGeocode, loading: geocodingLoading } = useGeocoding();

  const [markers, setMarkers] = useState<any[]>([]);
  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('');

  // Get current address on location change
  React.useEffect(() => {
    if (location) {
      reverseGeocode(location.latitude, location.longitude).then((address) => {
        if (address) {
          setCurrentAddress(address);
        }
      });
    }
  }, [location]);

  const handlePlaceSelected = async (placeId: string, description: string) => {
    try {
      // Get place details
      const placeDetails = await olaMapsAPI.getPlaceDetails(placeId);
      
      if (placeDetails && placeDetails.result) {
        const { lat, lng } = placeDetails.result.geometry.location;
        
        // Add marker
        setMarkers([
          ...markers,
          {
            id: placeId,
            coordinate: { latitude: lat, longitude: lng },
            title: description,
            icon: 'map-marker',
            color: CONSTANTS.theme.primaryColor,
          },
        ]);

        setDestination({ lat, lng });
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  const handleGetDirections = () => {
    if (location && destination) {
      getDirections(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: destination.lat, longitude: destination.lng }
      );
    }
  };

  const handleClearRoute = () => {
    setMarkers([]);
    setDestination(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <OlaMapView
          initialRegion={
            location
              ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
              : undefined
          }
          markers={markers}
          route={route || undefined}
          showUserLocation={true}
          followUserLocation={false}
        />

        {/* Loading overlay */}
        {locationLoading && (
          <View style={styles.loadingOverlay}>
            <Surface style={styles.loadingCard} elevation={4}>
              <MaterialCommunityIcons name="loading" size={24} color={CONSTANTS.theme.primaryColor} />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </Surface>
          </View>
        )}
      </View>

      {/* Search and Controls */}
      <View style={styles.controlsContainer}>
        {/* Current Location Info */}
        {currentAddress && (
          <Surface style={styles.locationCard} elevation={2}>
            <MaterialCommunityIcons name="map-marker-radius" size={20} color={CONSTANTS.theme.primaryColor} />
            <Text variant="bodySmall" style={styles.locationText} numberOfLines={2}>
              {currentAddress}
            </Text>
          </Surface>
        )}

        {/* Place Search */}
        <PlaceSearchInput
          placeholder="Search destination..."
          onPlaceSelected={handlePlaceSelected}
          icon="map-marker-plus"
        />

        {/* Route Info */}
        {destination && (
          <Surface style={styles.routeInfo} elevation={2}>
            {distance && duration && !directionsLoading && (
              <View style={styles.routeStats}>
                <Chip icon="road" style={styles.chip}>
                  {distance}
                </Chip>
                <Chip icon="clock" style={styles.chip}>
                  {duration}
                </Chip>
              </View>
            )}

            <View style={styles.actionButtons}>
              {!route && (
                <Button
                  mode="contained"
                  onPress={handleGetDirections}
                  loading={directionsLoading}
                  disabled={directionsLoading}
                  buttonColor={CONSTANTS.theme.primaryColor}
                  icon="directions"
                  style={styles.button}
                >
                  Get Directions
                </Button>
              )}

              <Button
                mode="outlined"
                onPress={handleClearRoute}
                icon="close"
                style={styles.button}
              >
                Clear
              </Button>
            </View>
          </Surface>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
  },
  mapContainer: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 248, 220, 0.8)',
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#333',
  },
  controlsContainer: {
    padding: 16,
    gap: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    gap: 8,
  },
  locationText: {
    flex: 1,
    color: '#666',
  },
  routeInfo: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    gap: 12,
  },
  routeStats: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
  },
});

