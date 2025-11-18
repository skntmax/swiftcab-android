/**
 * ConfirmationCard Component
 * 
 * Shows ride details and confirmation button
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const THEME = {
  primary: '#ED8902',
  text: '#000000',
  textSecondary: '#666666',
  surface: '#F5F5F5',
};

interface ConfirmationCardProps {
  fromLocation: string;
  toLocation: string;
  routeDistance: number | null;
  routeDuration: number | null;
  selectedVehicle: string;
  vehicleName: string;
  vehicleIcon: string;
  price: number;
  onConfirm: () => void;
  onBack: () => void;
}

const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  fromLocation,
  toLocation,
  routeDistance,
  routeDuration,
  selectedVehicle,
  vehicleName,
  vehicleIcon,
  price,
  onConfirm,
  onBack,
}) => {
  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.title}>Confirm Your Ride</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Location Details */}
      <View style={styles.section}>
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: '#10B981' }]} />
          <View style={styles.locationDetails}>
            <Text variant="labelSmall" style={styles.locationLabel}>From</Text>
            <Text variant="bodyMedium" style={styles.locationText}>{fromLocation}</Text>
          </View>
        </View>
        
        <View style={styles.locationDivider} />
        
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: '#EF4444' }]} />
          <View style={styles.locationDetails}>
            <Text variant="labelSmall" style={styles.locationLabel}>To</Text>
            <Text variant="bodyMedium" style={styles.locationText}>{toLocation}</Text>
          </View>
        </View>
      </View>

      {/* Route Info */}
      {(routeDistance || routeDuration) && (
        <View style={styles.routeInfo}>
          {routeDistance && (
            <View style={styles.routeItem}>
              <MaterialCommunityIcons name="map-marker-distance" size={20} color={THEME.primary} />
              <Text style={styles.routeText}>{routeDistance.toFixed(2)} km</Text>
            </View>
          )}
          {routeDuration && (
            <View style={styles.routeItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={THEME.primary} />
              <Text style={styles.routeText}>{routeDuration.toFixed(0)} min</Text>
            </View>
          )}
        </View>
      )}

      {/* Selected Vehicle */}
      <View style={styles.vehicleSection}>
        <Text variant="labelMedium" style={styles.vehicleLabel}>Selected Vehicle</Text>
        <View style={styles.vehicleRow}>
          <MaterialCommunityIcons name={vehicleIcon as any} size={32} color={THEME.primary} />
          <Text variant="titleMedium" style={styles.vehicleName}>{vehicleName}</Text>
        </View>
      </View>

      {/* Price */}
      <View style={styles.priceSection}>
        <Text variant="labelMedium" style={styles.priceLabel}>Total Fare</Text>
        <Text variant="headlineMedium" style={styles.priceAmount}>₹{price.toFixed(0)}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={onBack}
          style={styles.cancelButton}
          buttonColor={THEME.surface}
          textColor={THEME.text}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={onConfirm}
          style={styles.confirmButton}
          buttonColor={THEME.primary}
          textColor="white"
          icon="check"
        >
          Confirm Pickup
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: THEME.text,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  section: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    marginRight: 12,
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    color: THEME.textSecondary,
    marginBottom: 4,
  },
  locationText: {
    color: THEME.text,
    fontWeight: '600',
  },
  locationDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
    marginLeft: 24,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
    color: THEME.text,
    fontSize: 14,
    fontWeight: '600',
  },
  vehicleSection: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  vehicleLabel: {
    color: THEME.textSecondary,
    marginBottom: 8,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleName: {
    color: THEME.text,
    fontWeight: '700',
  },
  priceSection: {
    backgroundColor: THEME.primary + '20',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  priceLabel: {
    color: THEME.textSecondary,
    marginBottom: 8,
  },
  priceAmount: {
    color: THEME.primary,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
});

export default ConfirmationCard;

