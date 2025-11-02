import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Searchbar, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface City {
  id: string;
  name: string;
  state: string;
  isActive: boolean;
}

const CITIES: City[] = [
  { id: '1', name: 'Mumbai', state: 'Maharashtra', isActive: true },
  { id: '2', name: 'Delhi', state: 'Delhi', isActive: true },
  { id: '3', name: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: '4', name: 'Hyderabad', state: 'Telangana', isActive: true },
  { id: '5', name: 'Chennai', state: 'Tamil Nadu', isActive: true },
  { id: '6', name: 'Kolkata', state: 'West Bengal', isActive: true },
  { id: '7', name: 'Pune', state: 'Maharashtra', isActive: true },
  { id: '8', name: 'Ahmedabad', state: 'Gujarat', isActive: true },
  { id: '9', name: 'Jaipur', state: 'Rajasthan', isActive: true },
  { id: '10', name: 'Surat', state: 'Gujarat', isActive: true },
  { id: '11', name: 'Lucknow', state: 'Uttar Pradesh', isActive: true },
  { id: '12', name: 'Kanpur', state: 'Uttar Pradesh', isActive: true },
  { id: '13', name: 'Nagpur', state: 'Maharashtra', isActive: true },
  { id: '14', name: 'Indore', state: 'Madhya Pradesh', isActive: true },
  { id: '15', name: 'Thane', state: 'Maharashtra', isActive: true },
  { id: '16', name: 'Bhopal', state: 'Madhya Pradesh', isActive: true },
  { id: '17', name: 'Visakhapatnam', state: 'Andhra Pradesh', isActive: true },
  { id: '18', name: 'Pimpri-Chinchwad', state: 'Maharashtra', isActive: true },
  { id: '19', name: 'Patna', state: 'Bihar', isActive: true },
  { id: '20', name: 'Vadodara', state: 'Gujarat', isActive: true },
];

interface Props {
  onCitySelect: (city: City) => void;
}

const CitySelectionScreen: React.FC<Props> = ({ onCitySelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  
  const filteredCities = CITIES.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.state.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(city => city.isActive);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
  };

  const handleContinue = () => {
    if (selectedCity) {
      onCitySelect(selectedCity);
    }
  };

  const renderCityItem = ({ item }: { item: City }) => (
    <TouchableOpacity
      onPress={() => handleCitySelect(item)}
      activeOpacity={0.7}
    >
      <Surface
        style={[
          styles.cityCard,
          selectedCity?.id === item.id && styles.selectedCityCard
        ]}
        elevation={selectedCity?.id === item.id ? 4 : 1}
      >
        <View style={styles.cityInfo}>
          <Text variant="titleMedium" style={styles.cityName}>
            {item.name}
          </Text>
          <Text variant="bodyMedium" style={styles.stateName}>
            {item.state}
          </Text>
        </View>
        <View style={styles.cityIcon}>
          {selectedCity?.id === item.id ? (
            <MaterialCommunityIcons 
              name="check-circle" 
              size={24} 
              color={CONSTANTS.theme.primaryColor} 
            />
          ) : (
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color="#999" 
            />
          )}
        </View>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Choose Your City
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Select the city where you want to drive and earn
        </Text>
      </View>

      <Searchbar
        placeholder="Search cities..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={CONSTANTS.theme.primaryColor}
      />

      <FlatList
        data={filteredCities}
        keyExtractor={(item) => item.id}
        renderItem={renderCityItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={!selectedCity}
          style={styles.continueButton}
          buttonColor={CONSTANTS.theme.primaryColor}
        >
          Continue
        </Button>
        
        <Text style={styles.footerNote}>
          Don't see your city? We're expanding to new cities soon!
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
  searchBar: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  selectedCityCard: {
    borderWidth: 2,
    borderColor: CONSTANTS.theme.primaryColor,
    backgroundColor: '#FFF8E1',
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  stateName: {
    color: '#666',
  },
  cityIcon: {
    marginLeft: 16,
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

export default CitySelectionScreen;
