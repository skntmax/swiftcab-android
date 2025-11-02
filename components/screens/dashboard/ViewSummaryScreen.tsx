import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import StylishBackground from '../../ui/StylishBackground';

interface DashboardStats {
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  rating: number;
  onlineHours: number;
}

const ViewSummaryScreen: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    todayEarnings: 450,
    weeklyEarnings: 2800,
    monthlyEarnings: 12500,
    totalRides: 156,
    completedRides: 142,
    cancelledRides: 14,
    rating: 4.7,
    onlineHours: 6.5,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const renderEarningsCard = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="currency-inr" size={24} color={CONSTANTS.theme.primaryColor} />
          <Text variant="titleMedium" style={styles.cardTitle}>Earnings Overview</Text>
        </View>
        
        <View style={styles.earningsGrid}>
          <View style={styles.earningsItem}>
            <Text variant="headlineSmall" style={styles.earningsAmount}>₹{stats.todayEarnings}</Text>
            <Text variant="bodySmall" style={styles.earningsLabel}>Today</Text>
          </View>
          <View style={styles.earningsItem}>
            <Text variant="headlineSmall" style={styles.earningsAmount}>₹{stats.weeklyEarnings}</Text>
            <Text variant="bodySmall" style={styles.earningsLabel}>This Week</Text>
          </View>
          <View style={styles.earningsItem}>
            <Text variant="headlineSmall" style={styles.earningsAmount}>₹{stats.monthlyEarnings}</Text>
            <Text variant="bodySmall" style={styles.earningsLabel}>This Month</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderRidesCard = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="car" size={24} color={CONSTANTS.theme.primaryColor} />
          <Text variant="titleMedium" style={styles.cardTitle}>Rides Summary</Text>
        </View>
        
        <View style={styles.ridesGrid}>
          <View style={styles.ridesStat}>
            <Text variant="headlineMedium" style={styles.ridesNumber}>{stats.totalRides}</Text>
            <Text variant="bodySmall" style={styles.ridesLabel}>Total Rides</Text>
          </View>
          <View style={styles.ridesStat}>
            <Text variant="headlineMedium" style={[styles.ridesNumber, { color: '#4CAF50' }]}>{stats.completedRides}</Text>
            <Text variant="bodySmall" style={styles.ridesLabel}>Completed</Text>
          </View>
          <View style={styles.ridesStat}>
            <Text variant="headlineMedium" style={[styles.ridesNumber, { color: '#FF5722' }]}>{stats.cancelledRides}</Text>
            <Text variant="bodySmall" style={styles.ridesLabel}>Cancelled</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderPerformanceCard = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="star" size={24} color={CONSTANTS.theme.primaryColor} />
          <Text variant="titleMedium" style={styles.cardTitle}>Performance</Text>
        </View>
        
        <View style={styles.performanceGrid}>
          <View style={styles.performanceItem}>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
              <Text variant="titleLarge" style={styles.ratingText}>{stats.rating}</Text>
            </View>
            <Text variant="bodySmall" style={styles.performanceLabel}>Driver Rating</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text variant="titleLarge" style={styles.performanceValue}>{stats.onlineHours}h</Text>
            <Text variant="bodySmall" style={styles.performanceLabel}>Online Today</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderOnlineStatusCard = () => (
    <Surface style={styles.statusCard} elevation={2}>
      <View style={styles.statusContent}>
        <View style={styles.statusInfo}>
          <MaterialCommunityIcons 
            name={isOnline ? "wifi" : "wifi-off"} 
            size={24} 
            color={isOnline ? "#4CAF50" : "#FF5722"} 
          />
          <Text variant="titleMedium" style={styles.statusText}>
            You are {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={toggleOnlineStatus}
          buttonColor={isOnline ? "#FF5722" : CONSTANTS.theme.primaryColor}
          style={styles.statusButton}
        >
          {isOnline ? 'Go Offline' : 'Go Online'}
        </Button>
      </View>
    </Surface>
  );

  const renderQuickActions = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.cardTitle}>Quick Actions</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="history" size={32} color={CONSTANTS.theme.primaryColor} />
            <Text variant="bodySmall" style={styles.actionText}>Ride History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="currency-inr" size={32} color={CONSTANTS.theme.primaryColor} />
            <Text variant="bodySmall" style={styles.actionText}>Earnings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="file-document" size={32} color={CONSTANTS.theme.primaryColor} />
            <Text variant="bodySmall" style={styles.actionText}>Documents</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="help-circle" size={32} color={CONSTANTS.theme.primaryColor} />
            <Text variant="bodySmall" style={styles.actionText}>Support</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <StylishBackground variant="dashboard">
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderOnlineStatusCard()}
          {renderEarningsCard()}
          {renderRidesCard()}
          {renderPerformanceCard()}
          {renderQuickActions()}
        </ScrollView>
      </SafeAreaView>
    </StylishBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
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
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 12,
    color: '#333',
  },
  statusButton: {
    paddingHorizontal: 20,
  },
  earningsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningsItem: {
    alignItems: 'center',
    flex: 1,
  },
  earningsAmount: {
    color: CONSTANTS.theme.primaryColor,
    fontWeight: 'bold',
  },
  earningsLabel: {
    color: '#666',
    marginTop: 4,
  },
  ridesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ridesStat: {
    alignItems: 'center',
  },
  ridesNumber: {
    color: '#333',
    fontWeight: 'bold',
  },
  ridesLabel: {
    color: '#666',
    marginTop: 4,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceItem: {
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    color: '#333',
    fontWeight: 'bold',
  },
  performanceValue: {
    color: '#333',
    fontWeight: 'bold',
  },
  performanceLabel: {
    color: '#666',
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  actionText: {
    marginTop: 8,
    color: '#333',
    textAlign: 'center',
  },
});

export default ViewSummaryScreen;
