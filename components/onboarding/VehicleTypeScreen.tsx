import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface VehicleType {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  earnings: string;
  requirements: string[];
}

const VEHICLE_TYPES: VehicleType[] = [
  {
    id: 'bike',
    name: 'Bike',
    description: 'Quick delivery & short rides',
    icon: 'motorbike',
    features: ['Fast delivery', 'Quick rides', 'Less traffic'],
    earnings: '₹200-400/day',
    requirements: ['Valid driving license', 'Bike registration', 'Insurance'],
  },
  {
    id: 'auto',
    name: 'Auto Rickshaw',
    description: 'Local rides & short distances',
    icon: 'rickshaw',
    features: ['3-wheeler comfort', 'Local expertise', 'Good earnings'],
    earnings: '₹400-800/day',
    requirements: ['Auto permit', 'Valid license', 'Registration'],
  },
  {
    id: 'car',
    name: 'Car',
    description: 'Comfortable rides for families',
    icon: 'car',
    features: ['AC comfort', 'Safe travel', 'Higher earnings'],
    earnings: '₹600-1200/day',
    requirements: ['Car registration', 'Commercial license', 'Insurance'],
  },
  {
    id: 'cab',
    name: 'Cab/Taxi',
    description: 'Premium rides & airport transfers',
    icon: 'taxi',
    features: ['Premium service', 'Long distance', 'Best earnings'],
    earnings: '₹800-1500/day',
    requirements: ['Commercial permit', 'Tourist permit', 'All documents'],
  },
];

interface Props {
  onVehicleSelect: (vehicleType: VehicleType) => void;
}

const VehicleTypeScreen: React.FC<Props> = ({ onVehicleSelect }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);

  const handleVehicleSelect = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
  };

  const handleContinue = () => {
    if (selectedVehicle) {
      onVehicleSelect(selectedVehicle);
    }
  };

  const renderVehicleItem = ({ item }: { item: VehicleType }) => (
    <TouchableOpacity
      onPress={() => handleVehicleSelect(item)}
      activeOpacity={0.7}
    >
      <Surface
        style={[
          styles.vehicleCard,
          selectedVehicle?.id === item.id && styles.selectedVehicleCard
        ]}
        elevation={selectedVehicle?.id === item.id ? 4 : 2}
      >
        <View style={styles.cardHeader}>
          <View style={styles.vehicleIconContainer}>
            <MaterialCommunityIcons 
              name={item.icon as any} 
              size={40} 
              color={selectedVehicle?.id === item.id ? CONSTANTS.theme.primaryColor : '#666'} 
            />
          </View>
          <View style={styles.vehicleInfo}>
            <Text variant="titleLarge" style={styles.vehicleName}>
              {item.name}
            </Text>
            <Text variant="bodyMedium" style={styles.vehicleDescription}>
              {item.description}
            </Text>
            <Text variant="labelLarge" style={styles.earnings}>
              {item.earnings}
            </Text>
          </View>
          {selectedVehicle?.id === item.id && (
            <MaterialCommunityIcons 
              name="check-circle" 
              size={24} 
              color={CONSTANTS.theme.primaryColor} 
            />
          )}
        </View>

        <View style={styles.featuresContainer}>
          <Text variant="labelMedium" style={styles.sectionTitle}>Features:</Text>
          {item.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <MaterialCommunityIcons name="check" size={16} color={CONSTANTS.theme.primaryColor} />
              <Text variant="bodySmall" style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.requirementsContainer}>
          <Text variant="labelMedium" style={styles.sectionTitle}>Requirements:</Text>
          {item.requirements.slice(0, 2).map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <MaterialCommunityIcons name="circle-small" size={16} color="#666" />
              <Text variant="bodySmall" style={styles.requirementText}>{req}</Text>
            </View>
          ))}
          {item.requirements.length > 2 && (
            <Text variant="bodySmall" style={styles.moreRequirements}>
              +{item.requirements.length - 2} more...
            </Text>
          )}
        </View>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Choose Vehicle Type
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Select the type of vehicle you want to drive with SwiftCab
        </Text>
      </View>

      <FlatList
        data={VEHICLE_TYPES}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicleItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={!selectedVehicle}
          style={styles.continueButton}
          buttonColor={CONSTANTS.theme.primaryColor}
        >
          Continue with {selectedVehicle?.name || 'Selection'}
        </Button>
        
        <Text style={styles.footerNote}>
          You can change your vehicle type later in settings
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  vehicleCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  selectedVehicleCard: {
    borderWidth: 2,
    borderColor: CONSTANTS.theme.primaryColor,
    backgroundColor: '#FFF8E1',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleIconContainer: {
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vehicleDescription: {
    color: '#666',
    marginBottom: 8,
  },
  earnings: {
    color: CONSTANTS.theme.primaryColor,
    fontWeight: 'bold',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    color: '#666',
    marginLeft: 8,
  },
  requirementsContainer: {
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    color: '#666',
    marginLeft: 4,
  },
  moreRequirements: {
    color: CONSTANTS.theme.primaryColor,
    fontStyle: 'italic',
    marginLeft: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#FFF8DC',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  continueButton: {
    marginBottom: 12,
    paddingVertical: 4,
  },
  footerNote: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});

export default VehicleTypeScreen;
