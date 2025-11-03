import { selectCurrentUser } from '@/app/lib/reducers/auth/authSlice';
import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import AnimatedCard from '../../ui/AnimatedCard';
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
  const currentUser = useSelector(selectCurrentUser);
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
    <AnimatedCard delay={200} style={styles.cardMargin}>
      <LinearGradient
        colors={['#ED8902', '#FF9F1C', '#FFB84D']}
        style={styles.earningsGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="wallet" size={28} color="white" />
            <Text variant="titleMedium" style={styles.earningsCardTitle}>Earnings Overview</Text>
          </View>
          
          <View style={styles.earningsGrid}>
            <View style={styles.earningsItem}>
              <Text variant="headlineMedium" style={styles.earningsAmount}>₹{stats.todayEarnings}</Text>
              <Text variant="bodySmall" style={styles.earningsLabelWhite}>Today</Text>
              <View style={styles.earningsChange}>
                <MaterialCommunityIcons name="trending-up" size={14} color="#4CAF50" />
                <Text style={styles.changeText}>+12%</Text>
              </View>
            </View>
            <View style={styles.earningsItem}>
              <Text variant="headlineMedium" style={styles.earningsAmount}>₹{stats.weeklyEarnings}</Text>
              <Text variant="bodySmall" style={styles.earningsLabelWhite}>This Week</Text>
              <View style={styles.earningsChange}>
                <MaterialCommunityIcons name="trending-up" size={14} color="#4CAF50" />
                <Text style={styles.changeText}>+8%</Text>
              </View>
            </View>
            <View style={styles.earningsItem}>
              <Text variant="headlineMedium" style={styles.earningsAmount}>₹{stats.monthlyEarnings}</Text>
              <Text variant="bodySmall" style={styles.earningsLabelWhite}>This Month</Text>
              <View style={styles.earningsChange}>
                <MaterialCommunityIcons name="trending-up" size={14} color="#4CAF50" />
                <Text style={styles.changeText}>+15%</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </LinearGradient>
    </AnimatedCard>
  );

  const renderRidesCard = () => (
    <AnimatedCard delay={400} style={styles.cardMargin}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="car-multiple" size={24} color={CONSTANTS.theme.primaryColor} />
          <Text variant="titleMedium" style={styles.cardTitle}>Rides Summary</Text>
        </View>
        
        <View style={styles.ridesGrid}>
          <View style={styles.ridesStat}>
            <Text variant="headlineMedium" style={styles.ridesNumber}>{stats.totalRides}</Text>
            <Text variant="bodySmall" style={styles.ridesLabel}>Total Rides</Text>
            <View style={styles.ridesBadge}>
              <MaterialCommunityIcons name="chart-line" size={12} color="white" />
            </View>
          </View>
          <View style={styles.ridesStat}>
            <Text variant="headlineMedium" style={[styles.ridesNumber, { color: '#4CAF50' }]}>{stats.completedRides}</Text>
            <Text variant="bodySmall" style={styles.ridesLabel}>Completed</Text>
            <View style={[styles.ridesBadge, { backgroundColor: '#4CAF50' }]}>
              <MaterialCommunityIcons name="check" size={12} color="white" />
            </View>
          </View>
          <View style={styles.ridesStat}>
            <Text variant="headlineMedium" style={[styles.ridesNumber, { color: '#FF5722' }]}>{stats.cancelledRides}</Text>
            <Text variant="bodySmall" style={styles.ridesLabel}>Cancelled</Text>
            <View style={[styles.ridesBadge, { backgroundColor: '#FF5722' }]}>
              <MaterialCommunityIcons name="close" size={12} color="white" />
            </View>
          </View>
        </View>
      </Card.Content>
    </AnimatedCard>
  );

  const renderPerformanceCard = () => (
    <AnimatedCard delay={600} style={styles.cardMargin}>
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
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
          </View>
        </View>
      </Card.Content>
    </AnimatedCard>
  );

  const renderOnlineStatusCard = () => (
    <AnimatedCard delay={100} style={styles.cardMargin}>
      <LinearGradient
        colors={isOnline ? ['#4CAF50', '#66BB6A'] : ['#F44336', '#EF5350']}
        style={styles.statusGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.statusContent}>
          <View style={styles.statusInfo}>
            <View style={styles.statusIconContainer}>
              <MaterialCommunityIcons 
                name={isOnline ? "wifi" : "wifi-off"} 
                size={24} 
                color="white" 
              />
            </View>
            <View>
              <Text variant="titleMedium" style={styles.statusText}>
                {isOnline ? 'You\'re Online' : 'You\'re Offline'}
              </Text>
              <Text variant="bodySmall" style={styles.statusSubtext}>
                {isOnline ? 'Ready to accept rides' : 'Tap to start receiving rides'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={toggleOnlineStatus}
            style={styles.statusToggle}
          >
            <MaterialCommunityIcons 
              name={isOnline ? "pause" : "play"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </AnimatedCard>
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
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text variant="titleSmall" style={styles.welcomeText}>Welcome back,</Text>
            <Text variant="headlineSmall" style={styles.driverName}>
              {currentUser?.firstName || currentUser?.username || 'Driver'}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            {currentUser?.avatar ? (
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {(currentUser.firstName?.[0] || currentUser.username?.[0] || 'D').toUpperCase()}
                </Text>
              </View>
            ) : (
              <MaterialCommunityIcons name="account-circle" size={32} color={CONSTANTS.theme.primaryColor} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
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
  cardMargin: {
    marginBottom: 16,
  },
  earningsGradient: {
    borderRadius: 16,
  },
  earningsCardTitle: {
    color: 'white',
    fontWeight: '600',
  },
  earningsChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  changeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  ridesBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: CONSTANTS.theme.primaryColor,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(237, 137, 2, 0.2)',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: CONSTANTS.theme.primaryColor,
  },
  statusGradient: {
    borderRadius: 16,
    padding: 16,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusSubtext: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statusToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(237, 137, 2, 0.1)',
  },
  welcomeText: {
    color: '#666',
    fontWeight: '400',
  },
  driverName: {
    color: '#333',
    fontWeight: '700',
    marginTop: -2,
  },
  profileButton: {
    padding: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CONSTANTS.theme.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    color: 'white',
    fontWeight: 'bold',
  },
  earningsLabelWhite: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
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
