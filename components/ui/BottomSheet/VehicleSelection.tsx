/**
 * VehicleSelection Component
 * 
 * Grid of vehicle options with pricing
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

const THEME = {
  primary: '#ED8902',
  text: '#000000',
  textSecondary: '#666666',
  surface: '#F5F5F5',
};

interface Vehicle {
  id: string;
  name: string;
  icon: string;
  basePrice: number;
  perKm: number;
}

interface VehicleSelectionProps {
  vehicles: Vehicle[];
  routeDistance: number | null;
  selectedVehicle: string | null;
  onSelect: (vehicleId: string) => void;
  onBack?: () => void;
}

const VehicleSelection: React.FC<VehicleSelectionProps> = ({
  vehicles,
  routeDistance,
  selectedVehicle,
  onSelect,
  onBack,
}) => {
  const calculatePrice = (vehicle: Vehicle): number => {
    if (!routeDistance) return vehicle.basePrice;
    return vehicle.basePrice + (routeDistance * vehicle.perKm);
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={THEME.text} />
          </TouchableOpacity>
        )}
        <Text variant="titleMedium" style={styles.title}>Choose Your Ride</Text>
        {onBack && <View style={styles.placeholder} />}
      </View>
      <View style={styles.grid}>
        {vehicles.map((vehicle) => {
          const price = calculatePrice(vehicle);
          const isSelected = selectedVehicle === vehicle.id;
          
          return (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
              ]}
              onPress={() => onSelect(vehicle.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isSelected && styles.iconContainerSelected,
              ]}>
                <MaterialCommunityIcons 
                  name={vehicle.icon as any}
                  size={32}
                  color={isSelected ? 'white' : THEME.primary}
                />
              </View>
              <Text style={[
                styles.name,
                isSelected && styles.nameSelected,
              ]}>
                {vehicle.name}
              </Text>
              <Text style={[
                styles.price,
                isSelected && styles.priceSelected,
              ]}>
                ₹{price.toFixed(0)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    color: THEME.text,
    fontWeight: '700',
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    width: '30%',
    minWidth: 100,
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primary + '10',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainerSelected: {
    backgroundColor: THEME.primary,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  nameSelected: {
    color: THEME.primary,
    fontWeight: '700',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
  },
  priceSelected: {
    color: THEME.primary,
  },
});

export default VehicleSelection;

