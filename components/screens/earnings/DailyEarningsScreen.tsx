import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Chip, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DailyEarning {
  id: string;
  date: Date;
  totalEarnings: number;
  totalRides: number;
  totalDistance: number;
  onlineHours: number;
  bonus: number;
  deductions: number;
  netEarnings: number;
}

interface RideEarning {
  id: string;
  time: string;
  fromLocation: string;
  toLocation: string;
  distance: number;
  duration: number;
  fareAmount: number;
  tip: number;
  total: number;
}

const DAILY_EARNINGS: DailyEarning[] = [
  {
    id: '1',
    date: new Date(),
    totalEarnings: 650,
    totalRides: 12,
    totalDistance: 85.4,
    onlineHours: 8.5,
    bonus: 50,
    deductions: 15,
    netEarnings: 685,
  },
  {
    id: '2',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    totalEarnings: 520,
    totalRides: 9,
    totalDistance: 67.2,
    onlineHours: 7.0,
    bonus: 0,
    deductions: 10,
    netEarnings: 510,
  },
  {
    id: '3',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    totalEarnings: 780,
    totalRides: 14,
    totalDistance: 102.8,
    onlineHours: 9.5,
    bonus: 100,
    deductions: 20,
    netEarnings: 860,
  },
];

const TODAY_RIDES: RideEarning[] = [
  {
    id: '1',
    time: '09:15 AM',
    fromLocation: 'MG Road',
    toLocation: 'Electronic City',
    distance: 18.5,
    duration: 45,
    fareAmount: 185,
    tip: 20,
    total: 205,
  },
  {
    id: '2',
    time: '10:30 AM',
    fromLocation: 'Koramangala',
    toLocation: 'Whitefield',
    distance: 22.3,
    duration: 55,
    fareAmount: 220,
    tip: 0,
    total: 220,
  },
  {
    id: '3',
    time: '11:45 AM',
    fromLocation: 'HSR Layout',
    toLocation: 'Indiranagar',
    distance: 8.2,
    duration: 25,
    fareAmount: 95,
    tip: 10,
    total: 105,
  },
];

const DailyEarningsScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'summary' | 'rides'>('summary');

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const selectedEarning = DAILY_EARNINGS.find(
    earning => earning.date.toDateString() === selectedDate.toDateString()
  ) || DAILY_EARNINGS[0];

  const renderEarningsCard = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="currency-inr" size={24} color={CONSTANTS.theme.primaryColor} />
          <Text variant="titleMedium" style={styles.cardTitle}>
            Earnings for {formatDate(selectedDate)}
          </Text>
        </View>

        <View style={styles.earningsOverview}>
          <View style={styles.mainEarning}>
            <Text variant="headlineLarge" style={styles.totalEarnings}>
              ₹{selectedEarning.netEarnings}
            </Text>
            <Text variant="bodyMedium" style={styles.earningsLabel}>Net Earnings</Text>
          </View>

          <View style={styles.earningsBreakdown}>
            <View style={styles.breakdownItem}>
              <Text variant="bodyMedium" style={styles.breakdownValue}>₹{selectedEarning.totalEarnings}</Text>
              <Text variant="bodySmall" style={styles.breakdownLabel}>Fare Amount</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text variant="bodyMedium" style={[styles.breakdownValue, { color: '#4CAF50' }]}>
                +₹{selectedEarning.bonus}
              </Text>
              <Text variant="bodySmall" style={styles.breakdownLabel}>Bonus</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text variant="bodyMedium" style={[styles.breakdownValue, { color: '#FF5722' }]}>
                -₹{selectedEarning.deductions}
              </Text>
              <Text variant="bodySmall" style={styles.breakdownLabel}>Deductions</Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderStatsCard = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.cardTitle}>Performance Stats</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="car" size={20} color={CONSTANTS.theme.primaryColor} />
            <Text variant="titleMedium" style={styles.statValue}>{selectedEarning.totalRides}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Total Rides</Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={20} color={CONSTANTS.theme.primaryColor} />
            <Text variant="titleMedium" style={styles.statValue}>{selectedEarning.totalDistance} km</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Distance</Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock" size={20} color={CONSTANTS.theme.primaryColor} />
            <Text variant="titleMedium" style={styles.statValue}>{selectedEarning.onlineHours}h</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Online Hours</Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="speedometer" size={20} color={CONSTANTS.theme.primaryColor} />
            <Text variant="titleMedium" style={styles.statValue}>
              ₹{Math.round(selectedEarning.netEarnings / selectedEarning.onlineHours)}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Per Hour</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderRideItem = ({ item }: { item: RideEarning }) => (
    <Surface style={styles.rideCard} elevation={1}>
      <View style={styles.rideHeader}>
        <View style={styles.rideTime}>
          <MaterialCommunityIcons name="clock" size={16} color="#666" />
          <Text variant="bodySmall" style={styles.timeText}>{item.time}</Text>
        </View>
        <Text variant="titleMedium" style={styles.rideEarning}>₹{item.total}</Text>
      </View>

      <View style={styles.rideRoute}>
        <View style={styles.routePoint}>
          <MaterialCommunityIcons name="circle" size={8} color="#4CAF50" />
          <Text variant="bodySmall" style={styles.locationText}>{item.fromLocation}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <MaterialCommunityIcons name="circle" size={8} color="#FF5722" />
          <Text variant="bodySmall" style={styles.locationText}>{item.toLocation}</Text>
        </View>
      </View>

      <View style={styles.rideDetails}>
        <View style={styles.rideDetailItem}>
          <Text variant="bodySmall" style={styles.detailLabel}>{item.distance} km</Text>
        </View>
        <View style={styles.rideDetailItem}>
          <Text variant="bodySmall" style={styles.detailLabel}>{item.duration} min</Text>
        </View>
        <View style={styles.rideDetailItem}>
          <Text variant="bodySmall" style={styles.detailLabel}>Fare: ₹{item.fareAmount}</Text>
        </View>
        {item.tip > 0 && (
          <View style={styles.rideDetailItem}>
            <Text variant="bodySmall" style={[styles.detailLabel, { color: '#4CAF50' }]}>
              Tip: ₹{item.tip}
            </Text>
          </View>
        )}
      </View>
    </Surface>
  );

  const renderDateSelector = () => (
    <View style={styles.dateSelector}>
      {DAILY_EARNINGS.map((earning) => (
        <TouchableOpacity
          key={earning.id}
          style={[
            styles.dateChip,
            selectedDate.toDateString() === earning.date.toDateString() && styles.selectedDateChip
          ]}
          onPress={() => setSelectedDate(earning.date)}
        >
          <Text style={[
            styles.dateChipText,
            selectedDate.toDateString() === earning.date.toDateString() && styles.selectedDateChipText
          ]}>
            {formatDate(earning.date)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderViewModeSelector = () => (
    <View style={styles.viewModeSelector}>
      <Chip
        selected={viewMode === 'summary'}
        onPress={() => setViewMode('summary')}
        style={[styles.modeChip, viewMode === 'summary' && styles.selectedModeChip]}
        textStyle={viewMode === 'summary' ? styles.selectedModeText : styles.modeText}
      >
        Summary
      </Chip>
      <Chip
        selected={viewMode === 'rides'}
        onPress={() => setViewMode('rides')}
        style={[styles.modeChip, viewMode === 'rides' && styles.selectedModeChip]}
        textStyle={viewMode === 'rides' ? styles.selectedModeText : styles.modeText}
      >
        Individual Rides
      </Chip>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderDateSelector()}
      {renderViewModeSelector()}

      {viewMode === 'summary' ? (
        <FlatList
          data={[1]} // Dummy data for summary view
          keyExtractor={(item) => item.toString()}
          renderItem={() => (
            <View>
              {renderEarningsCard()}
              {renderStatsCard()}
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <FlatList
          data={TODAY_RIDES}
          keyExtractor={(item) => item.id}
          renderItem={renderRideItem}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={() => (
            <Text variant="titleMedium" style={styles.ridesHeader}>
              Today's Rides ({TODAY_RIDES.length})
            </Text>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
  },
  dateSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedDateChip: {
    backgroundColor: CONSTANTS.theme.primaryColor,
    borderColor: CONSTANTS.theme.primaryColor,
  },
  dateChipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedDateChipText: {
    color: 'white',
  },
  viewModeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  modeChip: {
    backgroundColor: 'white',
  },
  selectedModeChip: {
    backgroundColor: CONSTANTS.theme.primaryColor,
  },
  modeText: {
    color: '#666',
  },
  selectedModeText: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
    color: '#333',
    fontWeight: '600',
  },
  earningsOverview: {
    alignItems: 'center',
  },
  mainEarning: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalEarnings: {
    color: CONSTANTS.theme.primaryColor,
    fontWeight: 'bold',
  },
  earningsLabel: {
    color: '#666',
    marginTop: 4,
  },
  earningsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownValue: {
    color: '#333',
    fontWeight: '600',
  },
  breakdownLabel: {
    color: '#666',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 12,
  },
  statValue: {
    color: '#333',
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  ridesHeader: {
    color: '#333',
    fontWeight: '600',
    marginBottom: 16,
  },
  rideCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 4,
    color: '#666',
  },
  rideEarning: {
    color: CONSTANTS.theme.primaryColor,
    fontWeight: 'bold',
  },
  rideRoute: {
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  routeLine: {
    width: 1,
    height: 16,
    backgroundColor: '#DDD',
    marginLeft: 4,
    marginVertical: 2,
  },
  locationText: {
    marginLeft: 8,
    color: '#333',
  },
  rideDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rideDetailItem: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  detailLabel: {
    color: '#666',
    fontSize: 11,
  },
});

export default DailyEarningsScreen;
