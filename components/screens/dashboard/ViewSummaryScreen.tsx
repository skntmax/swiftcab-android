import { useSocket } from '@/app/contexts/SocketProvider';
import { useLogoutMutation } from '@/app/lib/api';
import { clearAuth, selectCurrentUser } from '@/app/lib/reducers/auth/authSlice';
import { CONSTANTS } from '@/app/utils/const';
import { SOCKET_EVENTS } from '@/app/utils/socketConstants';
import LiveOlaMapView from '@/components/map/LiveOlaMapView';
import AcceptRideModal from '@/components/modals/AcceptRideModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Dialog, Divider, Menu, Portal, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
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
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [permissionDialogVisible, setPermissionDialogVisible] = useState(false);
  const [rideAcceptedDialogVisible, setRideAcceptedDialogVisible] = useState(false);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  
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

  // Socket and location tracking
  const { socket, isConnected } = useSocket();
  const [driverLoc, setDriverLoc] = useState<{
    lat: number;
    lng: number;
    driver: string;
    timestamp: string;
    isAvailable: boolean;
    isLoggedIn: boolean;
  } | null>(null);
  const [rideRequests, setRideRequests] = useState<any[]>([]);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  
  // Map accordion state
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mapDistance, setMapDistance] = useState<number | null>(null);
  const mapAnimation = useState(new Animated.Value(0))[0];
  
  // Dashboard accordion state (for earnings, rides, performance, quick actions)
  const [dashboardExpanded, setDashboardExpanded] = useState(false);
  const dashboardAnimation = useState(new Animated.Value(0))[0];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleLogout = async () => {
    setLogoutDialogVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutDialogVisible(false);
    
    // Simple logout - just like web portal
    console.log('🚪 Logging out...');
    
    // Emit driver logged out event
    if (socket && isConnected && driverLoc) {
      socket.emit(SOCKET_EVENTS.EV_DRIVER_LOGGED_OUT, {
        ...driverLoc,
        isLoggedIn: false,
      });
    }
    
    // Clear auth data (like deleteCookie in web)
    dispatch(clearAuth());
    
    // Navigate to login
    router.replace('/');
  };

  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    // Update driver availability in location data
    if (driverLoc) {
      const updatedLoc = { ...driverLoc, isAvailable: newStatus };
      setDriverLoc(updatedLoc);
      
      // Send updated availability to socket
      if (socket && isConnected) {
        socket.emit(SOCKET_EVENTS.EV_DRIVER_LIVE_LOCATION, updatedLoc);
      }
    }
  };

  // Request location permissions and start tracking
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermissionDialogVisible(true);
          return;
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
        // Suppress location errors from browser extensions
        if (error instanceof Error && error.message.includes('Illegal invocation')) {
          console.log('⚠️ Location API conflict with browser extension (ignoring)');
          return;
        }
      }
    })();
  }, []);

  // Track location every 5 seconds
  useEffect(() => {
    console.log('🌍 Starting location tracking...');
    let locationInterval: ReturnType<typeof setInterval>;
    let updateCount = 0;

    const updateLocation = async () => {
      updateCount++;
      console.log(`📍 Location update attempt #${updateCount} at ${new Date().toLocaleTimeString()}`);
      
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const newLoc = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          driver: currentUser?.username || 'unknown',
          timestamp: new Date().toISOString(),
          isAvailable: isOnline,
          isLoggedIn: true,
        };

        console.log(`✅ Location updated: ${newLoc.lat.toFixed(6)}, ${newLoc.lng.toFixed(6)}`);
        setDriverLoc(newLoc);
      } catch (error) {
        // Suppress location errors from browser extensions
        if (error instanceof Error && error.message.includes('Illegal invocation')) {
          console.log('⚠️ Location API conflict with browser extension (using mock location for testing)');
          // Use mock location for web testing
          const mockLoc = {
            lat: 28.7041 + (Math.random() * 0.001), // Mock location with slight variation
            lng: 77.1025 + (Math.random() * 0.001),
            driver: currentUser?.username || 'unknown',
            timestamp: new Date().toISOString(),
            isAvailable: isOnline,
            isLoggedIn: true,
          };
          console.log(`🧪 Using mock location: ${mockLoc.lat.toFixed(6)}, ${mockLoc.lng.toFixed(6)}`);
          setDriverLoc(mockLoc);
          return;
        }
        console.error('❌ Error getting location:', error);
      }
    };

    // Get location immediately
    updateLocation();

    // Then update every 5 seconds
    console.log('⏰ Setting up 5-second interval for location updates');
    locationInterval = setInterval(updateLocation, 5000);

    return () => {
      console.log('🛑 Stopping location tracking');
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [currentUser?.username, isOnline]);

  // Send location to socket whenever it updates
  useEffect(() => {
    if (socket && isConnected && driverLoc && driverLoc.lat && driverLoc.lng) {
      console.log(`🔌 Emitting location to socket: ${driverLoc.lat.toFixed(6)}, ${driverLoc.lng.toFixed(6)}`);
      socket.emit(SOCKET_EVENTS.EV_DRIVER_LIVE_LOCATION, driverLoc);
      console.log('✅ Location emitted successfully');
    } else {
      if (!socket) console.log('⚠️ Socket not available');
      if (!isConnected) console.log('⚠️ Socket not connected');
      if (!driverLoc) console.log('⚠️ Driver location not set');
    }
  }, [socket, isConnected, driverLoc]);

  // Listen for ride requests
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleRideRequest = (data: any) => {
      console.log('🚗 New ride request received:', data);
      setRideRequests(prev => [...prev, data]);
    };

    const handleRideInitiated = (data: any) => {
      console.log('🚖 RIDE_INITIATED_BY_DRIVER:', data);
      setLoadingIndex(null);
      setRideAcceptedDialogVisible(true);
    };

    socket.on(SOCKET_EVENTS.NEW_RIDE_REQUEST, handleRideRequest);
    socket.on(SOCKET_EVENTS.RIDE_INTIATED_BY_DRIVER, handleRideInitiated);

    return () => {
      socket.off(SOCKET_EVENTS.NEW_RIDE_REQUEST, handleRideRequest);
      socket.off(SOCKET_EVENTS.RIDE_INTIATED_BY_DRIVER, handleRideInitiated);
    };
  }, [socket, isConnected]);

  // Send driver logout event on unmount
  useEffect(() => {
    return () => {
      if (socket && isConnected && driverLoc) {
        socket.emit(SOCKET_EVENTS.EV_DRIVER_LOGGED_OUT, {
          ...driverLoc,
          isLoggedIn: false,
        });
      }
    };
  }, [socket, isConnected, driverLoc]);

  const handleAcceptRide = (index: number) => {
    const rideInfo = rideRequests[index];
    console.log('Accepting ride:', rideInfo);

    setLoadingIndex(index);

    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.DRIVER_ACCEPTED_THE_RIDE, rideInfo);
    }
  };

  const handleDeclineRide = (index: number) => {
    console.log('Declining ride at index:', index);
    setRideRequests(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle map accordion
  const toggleMap = () => {
    const toValue = mapExpanded ? 0 : 1;
    
    Animated.spring(mapAnimation, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
    
    setMapExpanded(!mapExpanded);
  };

  const mapHeight = mapAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 450], // Fixed height for map
  });

  const rotateIcon = mapAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Toggle dashboard accordion
  const toggleDashboard = () => {
    const toValue = dashboardExpanded ? 0 : 1;
    
    Animated.spring(dashboardAnimation, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
    
    setDashboardExpanded(!dashboardExpanded);
  };

  const dashboardHeight = dashboardAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1400], // Dynamic height for all dashboard cards
  });

  const rotateDashboardIcon = dashboardAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const renderLiveMapAccordion = () => (
    <AnimatedCard delay={50} style={styles.cardMargin}>
      <Card.Content style={{ padding: 0 }}>
        {/* Accordion Header */}
        <TouchableOpacity
          style={styles.mapAccordionHeader}
          onPress={toggleMap}
          activeOpacity={0.7}
        >
          <View style={styles.mapHeaderLeft}>
            <View style={styles.mapIconContainer}>
              <MaterialCommunityIcons name="map-marker-radius" size={24} color="white" />
            </View>
            <View>
              <Text variant="titleMedium" style={styles.mapHeaderTitle}>
                Live Location Map
              </Text>
              <Text variant="bodySmall" style={styles.mapHeaderSubtitle}>
                {mapExpanded ? 'Tap to hide' : 'Tap to view live tracking'}
              </Text>
            </View>
          </View>
          <View style={styles.mapHeaderRight}>
            {driverLoc && (
              <View style={styles.locationBadge}>
                <View style={styles.pulseDot} />
                <Text variant="labelSmall" style={styles.locationBadgeText}>
                  Tracking
                </Text>
              </View>
            )}
            <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
              <MaterialCommunityIcons
                name="chevron-down"
                size={28}
                color={CONSTANTS.theme.primaryColor}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>

        {/* Accordion Content */}
        <Animated.View style={[styles.mapAccordionContent, { height: mapHeight }]}>
          <View style={styles.mapContainer}>
            {driverLoc && (
              <>
                <LiveOlaMapView
                  currentLocation={{
                    lat: driverLoc.lat,
                    lng: driverLoc.lng,
                  }}
                  onDistanceCalculated={(distance) => setMapDistance(distance)}
                />
                
                {/* Map Info Overlay */}
                <View style={styles.mapInfoOverlay}>
                  <View style={styles.mapInfoCard}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#10b981" />
                    <Text variant="bodySmall" style={styles.mapInfoText}>
                      {driverLoc.lat.toFixed(6)}, {driverLoc.lng.toFixed(6)}
                    </Text>
                  </View>
                  
                  {mapDistance && (
                    <View style={styles.mapInfoCard}>
                      <MaterialCommunityIcons name="map" size={16} color="#0ea5e9" />
                      <Text variant="bodySmall" style={styles.mapInfoText}>
                        {mapDistance.toFixed(2)} km
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.mapInfoCard}>
                    <MaterialCommunityIcons 
                      name={isConnected ? "lan-connect" : "lan-disconnect"} 
                      size={16} 
                      color={isConnected ? "#10b981" : "#ef4444"} 
                    />
                    <Text variant="bodySmall" style={styles.mapInfoText}>
                      {isConnected ? 'Connected' : 'Offline'}
                    </Text>
                  </View>
                </View>
              </>
            )}
            
            {!driverLoc && (
              <View style={styles.mapPlaceholder}>
                <MaterialCommunityIcons name="map-marker-off" size={48} color="#ccc" />
                <Text variant="bodyMedium" style={styles.mapPlaceholderText}>
                  Waiting for location...
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Card.Content>
    </AnimatedCard>
  );

  const renderDashboardAccordion = () => (
    <AnimatedCard delay={150} style={styles.cardMargin}>
      <Card.Content style={{ padding: 0 }}>
        {/* Dashboard Accordion Header */}
        <TouchableOpacity
          style={styles.dashboardAccordionHeader}
          onPress={toggleDashboard}
          activeOpacity={0.7}
        >
          <View style={styles.mapHeaderLeft}>
            <View style={[styles.mapIconContainer, { backgroundColor: '#4f46e5' }]}>
              <MaterialCommunityIcons name="view-dashboard" size={24} color="white" />
            </View>
            <View>
              <Text variant="titleMedium" style={styles.mapHeaderTitle}>
                Dashboard Overview
              </Text>
              <Text variant="bodySmall" style={styles.mapHeaderSubtitle}>
                {dashboardExpanded ? 'Tap to hide details' : 'Tap to view earnings, rides & more'}
              </Text>
            </View>
          </View>
          <View style={styles.mapHeaderRight}>
            <View style={[styles.locationBadge, { backgroundColor: '#eef2ff' }]}>
              <MaterialCommunityIcons name="chart-line" size={14} color="#4f46e5" />
              <Text variant="labelSmall" style={[styles.locationBadgeText, { color: '#4f46e5' }]}>
                Stats
              </Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: rotateDashboardIcon }] }}>
              <MaterialCommunityIcons
                name="chevron-down"
                size={28}
                color="#4f46e5"
              />
            </Animated.View>
          </View>
        </TouchableOpacity>

        {/* Dashboard Accordion Content */}
        <Animated.View style={[styles.dashboardAccordionContent, { height: dashboardHeight }]}>
          <View style={styles.dashboardContainer}>
            {renderEarningsCard()}
            {renderRidesCard()}
            {renderPerformanceCard()}
            {renderQuickActions()}
          </View>
        </Animated.View>
      </Card.Content>
    </AnimatedCard>
  );

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
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.statusText}>
                {isOnline ? 'You\'re Online' : 'You\'re Offline'}
              </Text>
              <Text variant="bodySmall" style={styles.statusSubtext}>
                {isOnline ? 'Ready to accept rides' : 'Tap to start receiving rides'}
              </Text>
              
              {/* Location Tracking Info */}
              {driverLoc && driverLoc.lat && driverLoc.lng && (
                <View style={styles.locationInfo}>
                  <View style={styles.locationRow}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={12} color="rgba(255,255,255,0.9)" />
                    <Text variant="bodySmall" style={styles.locationText}>
                      {driverLoc.lat.toFixed(5)}, {driverLoc.lng.toFixed(5)}
                    </Text>
                  </View>
                  <View style={styles.locationRow}>
                    <MaterialCommunityIcons 
                      name={isConnected ? "lan-connect" : "lan-disconnect"} 
                      size={12} 
                      color={isConnected ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)"} 
                    />
                    <Text variant="bodySmall" style={styles.locationText}>
                      {isConnected ? 'Socket Connected' : 'Socket Disconnected'}
                    </Text>
                  </View>
                  <View style={styles.locationRow}>
                    <MaterialCommunityIcons name="clock-outline" size={12} color="rgba(255,255,255,0.9)" />
                    <Text variant="bodySmall" style={styles.locationText}>
                      Updated: {new Date(driverLoc.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              )}
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
          <View style={styles.headerRight}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity 
                  style={styles.profileButton}
                  onPress={() => setMenuVisible(true)}
                >
                  {currentUser?.avatar ? (
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {(currentUser.firstName?.[0] || currentUser.username?.[0] || 'D').toUpperCase()}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {(currentUser?.firstName?.[0] || currentUser?.username?.[0] || 'D').toUpperCase()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              }
            >
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  // Navigate to profile
                }} 
                title="Profile" 
                leadingIcon="account"
              />
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  // Navigate to settings
                }} 
                title="Settings" 
                leadingIcon="cog"
              />
              <Divider />
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  handleLogout();
                }} 
                title={isLoggingOut ? "Logging out..." : "Logout"}
                leadingIcon="logout"
                titleStyle={{ color: '#F44336' }}
                disabled={isLoggingOut}
              />
            </Menu>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Always Visible - Homepage */}
          {renderDashboardAccordion()}
          {renderOnlineStatusCard()}
          {renderLiveMapAccordion()}
          
          {/* Collapsible Dashboard Section */}
        </ScrollView>

        {/* Ride Request Modals */}
        {rideRequests.map((req, index) => (
          <AcceptRideModal
            key={req.customerViewDetails?.correlationId || index}
            open={true}
            rideData={req}
            onClose={() => handleDeclineRide(index)}
            onAccept={() => handleAcceptRide(index)}
            loading={loadingIndex === index}
          />
        ))}

        {/* Paper Dialogs */}
        <Portal>
          {/* Logout Confirmation Dialog */}
          <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
            <Dialog.Icon icon="logout" size={32} />
            <Dialog.Title style={styles.dialogTitle}>Logout</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={styles.dialogContent}>
                Are you sure you want to logout?
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setLogoutDialogVisible(false)}>
                Cancel
              </Button>
              <Button 
                onPress={confirmLogout}
                textColor="#F44336"
                loading={isLoggingOut}
                disabled={isLoggingOut}
              >
                Logout
              </Button>
            </Dialog.Actions>
          </Dialog>

          {/* Location Permission Dialog */}
          <Dialog visible={permissionDialogVisible} onDismiss={() => setPermissionDialogVisible(false)}>
            <Dialog.Icon icon="map-marker-alert" size={32} />
            <Dialog.Title style={styles.dialogTitle}>Permission Required</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={styles.dialogContent}>
                Location permission is required to receive ride requests.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setPermissionDialogVisible(false)}>
                OK
              </Button>
            </Dialog.Actions>
          </Dialog>

          {/* Ride Accepted Dialog */}
          <Dialog visible={rideAcceptedDialogVisible} onDismiss={() => setRideAcceptedDialogVisible(false)}>
            <Dialog.Icon icon="check-circle" size={32} />
            <Dialog.Title style={styles.dialogTitle}>Ride Accepted</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={styles.dialogContent}>
                Ride has been successfully accepted!
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setRideAcceptedDialogVisible(false)}>
                OK
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
  locationInfo: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginLeft: 6,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
    padding: 4,
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
  dialogTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  dialogContent: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  // Map Accordion Styles
  mapAccordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  mapHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mapIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: CONSTANTS.theme.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mapHeaderTitle: {
    color: '#333',
    fontWeight: '600',
  },
  mapHeaderSubtitle: {
    color: '#666',
    marginTop: 2,
  },
  mapHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  locationBadgeText: {
    color: '#10b981',
    fontWeight: '600',
  },
  mapAccordionContent: {
    overflow: 'hidden',
  },
  mapContainer: {
    padding: 12,
    paddingTop: 0,
  },
  mapInfoOverlay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  mapInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mapInfoText: {
    color: '#333',
    fontSize: 11,
    fontWeight: '500',
  },
  mapPlaceholder: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  mapPlaceholderText: {
    color: '#999',
    marginTop: 12,
  },
  // Dashboard Accordion Styles
  dashboardAccordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  dashboardAccordionContent: {
    overflow: 'hidden',
  },
  dashboardContainer: {
    paddingBottom: 12,
  },
});

export default ViewSummaryScreen;
