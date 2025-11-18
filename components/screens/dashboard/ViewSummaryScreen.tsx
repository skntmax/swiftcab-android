import { useSocket } from '@/app/contexts/SocketProvider';
import { useLogoutMutation } from '@/app/lib/api';
import { clearAuth, selectCurrentUser } from '@/app/lib/reducers/auth/authSlice';
import { SOCKET_EVENTS } from '@/app/utils/socketConstants';
import ReactNativeMapView from '@/components/map/ReactNativeMapView';
import AcceptRideModal from '@/components/modals/AcceptRideModal';
import ConfirmationCard from '@/components/ui/BottomSheet/ConfirmationCard';
import RideBottomSheet, { RideBottomSheetRef } from '@/components/ui/BottomSheet/RideBottomSheet';
import SearchingUI from '@/components/ui/BottomSheet/SearchingUI';
import SearchModal from '@/components/ui/BottomSheet/SearchModal';
import VehicleSelection from '@/components/ui/BottomSheet/VehicleSelection';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Orange and White Theme
const THEME = {
  primary: '#ED8902',
  primaryLight: '#FF9F1C',
  primaryDark: '#CC7700',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  shadow: 'rgba(237, 137, 2, 0.2)',
};

interface SearchHistoryItem {
  id: string;
  from: string;
  to: string;
  timestamp: Date;
}

const ViewSummaryScreen: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [permissionDialogVisible, setPermissionDialogVisible] = useState(false);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

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
  
  // Search section state
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [fromPlaceId, setFromPlaceId] = useState('');
  const [toPlaceId, setToPlaceId] = useState('');
  const [fromCoordinates, setFromCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [toCoordinates, setToCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSearchingForRiders, setIsSearchingForRiders] = useState(false);
  const [availableRiders, setAvailableRiders] = useState<Array<{ id: string; lat: number; lng: number; name: string }>>([]);
  
  // Bottom sheet state
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0); // 0 = 30%, 1 = 70%, 2 = 40%
  const [searchMode, setSearchMode] = useState<'from' | 'to' | null>(null); // Which input is being searched
  const bottomSheetRef = React.useRef<RideBottomSheetRef>(null);
  
  // Search history state
  const [searchHistory, setSearchHistory] = useState<Array<{ placeId: string; description: string; lat?: number; lng?: number; timestamp: Date }>>([]);

  const handleLogout = async () => {
    setLogoutDialogVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutDialogVisible(false);
    console.log('🚪 Logging out...');
    
    if (socket && isConnected && driverLoc) {
      socket.emit(SOCKET_EVENTS.EV_DRIVER_LOGGED_OUT, {
        ...driverLoc,
        isLoggedIn: false,
      });
    }
    
    dispatch(clearAuth());
    router.replace('/');
  };

  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    if (driverLoc) {
      const updatedLoc = { ...driverLoc, isAvailable: newStatus };
      setDriverLoc(updatedLoc);
      
      if (socket && isConnected) {
        socket.emit(SOCKET_EVENTS.EV_DRIVER_LIVE_LOCATION, updatedLoc);
      }
    }
  };

  // Handle input click - open search modal
  const handleFromInputClick = () => {
    setSearchMode('from');
    setBottomSheetIndex(1); // Update state to 70% (index 1)
    // Immediately snap to 70% for instant expansion
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleToInputClick = () => {
    setSearchMode('to');
    setBottomSheetIndex(1); // Update state to 70% (index 1)
    // Immediately snap to 70% for instant expansion
    bottomSheetRef.current?.snapToIndex(1);
  };

  // Handle place selection
  const handleFromPlaceSelected = (placeId: string, description: string, lat?: number, lng?: number) => {
    setFromLocation(description);
    setFromPlaceId(placeId);
    if (lat && lng) {
      setFromCoordinates({ lat, lng });
    }
    // Add to search history
    addToSearchHistory(placeId, description, lat, lng);
    setSearchMode(null);
    // Return to 30% after a small delay to ensure smooth transition
    setTimeout(() => {
      setBottomSheetIndex(0); // Return to 30%
      bottomSheetRef.current?.snapToIndex(0); // Snap back to 30%
    }, 100);
  };

  const handleToPlaceSelected = (placeId: string, description: string, lat?: number, lng?: number) => {
    setToLocation(description);
    setToPlaceId(placeId);
    if (lat && lng) {
      setToCoordinates({ lat, lng });
    }
    // Add to search history
    addToSearchHistory(placeId, description, lat, lng);
    setSearchMode(null);
    // Return to 30% after a small delay to ensure smooth transition
    setTimeout(() => {
      setBottomSheetIndex(0); // Return to 30%
      bottomSheetRef.current?.snapToIndex(0); // Snap back to 30%
    }, 100);
  };

  // Add place to search history
  const addToSearchHistory = (placeId: string, description: string, lat?: number, lng?: number) => {
    const newHistoryItem = {
      placeId,
      description,
      lat,
      lng,
      timestamp: new Date(),
    };
    
    // Remove duplicate if exists and add to top
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.placeId !== placeId);
      return [newHistoryItem, ...filtered].slice(0, 10); // Keep last 10 items
    });
  };

  const handleRouteCalculated = (distance: number, duration: number) => {
    setRouteDistance(distance);
    setRouteDuration(duration);
    console.log('✅ Route calculated:', distance.toFixed(2), 'km,', duration.toFixed(0), 'min');
  };


  // Vehicle types with base pricing (per km)
  const vehicleTypes = [
    { id: 'bike', name: 'Bike', icon: 'motorbike', basePrice: 2, perKm: 1.5 },
    { id: 'auto', name: 'Auto', icon: 'rickshaw', basePrice: 25, perKm: 8 },
    { id: 'car', name: 'Car', icon: 'car', basePrice: 50, perKm: 12 },
    { id: 'xuv', name: 'XUV', icon: 'car-sedan', basePrice: 80, perKm: 15 },
    { id: 'suv', name: 'SUV', icon: 'car-wagon', basePrice: 100, perKm: 18 },
    { id: 'e-rickshaw', name: 'E-Rickshaw', icon: 'rickshaw-electric', basePrice: 20, perKm: 6 },
    { id: 'sharing', name: 'Sharing', icon: 'car-multiple', basePrice: 15, perKm: 4 },
  ];

  // Calculate price for a vehicle
  const calculatePrice = (vehicle: typeof vehicleTypes[0]): number => {
    if (!routeDistance) return 0;
    return vehicle.basePrice + (routeDistance * vehicle.perKm);
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    console.log('🚗 Selected vehicle:', vehicleId);
    // Show confirmation screen
    setShowConfirmation(true);
  };

  // Handle confirm pickup
  const handleConfirmPickup = () => {
    if (selectedVehicle && fromCoordinates && toCoordinates) {
      console.log('✅ Pickup confirmed - starting rider search');
      setShowConfirmation(false);
      setIsSearchingForRiders(true);
      // TODO: Start searching for available riders via socket/API
      // For now, simulate available riders
      setTimeout(() => {
        setAvailableRiders([
          { id: '1', lat: driverLoc!.lat + 0.001, lng: driverLoc!.lng + 0.001, name: 'Rider 1' },
          { id: '2', lat: driverLoc!.lat - 0.001, lng: driverLoc!.lng - 0.001, name: 'Rider 2' },
        ]);
      }, 2000);
    }
  };

  // Handle cancel ride - reset all state
  const handleCancelRide = () => {
    console.log('🚫 Cancelling ride - resetting to initial state');
    setFromLocation('');
    setToLocation('');
    setFromPlaceId('');
    setToPlaceId('');
    setFromCoordinates(null);
    setToCoordinates(null);
    setRouteDistance(null);
    setRouteDuration(null);
    setSelectedVehicle(null);
    setShowConfirmation(false);
    setIsSearchingForRiders(false);
    setAvailableRiders([]);
    setBottomSheetIndex(0);
    setSearchMode(null);
  };

  // Handle back from vehicle selection - clear route and go to initial state
  const handleBackFromVehicleSelection = () => {
    setFromLocation('');
    setToLocation('');
    setFromPlaceId('');
    setToPlaceId('');
    setFromCoordinates(null);
    setToCoordinates(null);
    setRouteDistance(null);
    setRouteDuration(null);
    setSelectedVehicle(null);
    setShowConfirmation(false);
    setBottomSheetIndex(0);
  };

  // Calculate final price
  const getFinalPrice = (): number => {
    if (!selectedVehicle || !routeDistance) return 0;
    const vehicle = vehicleTypes.find(v => v.id === selectedVehicle);
    if (!vehicle) return 0;
    return calculatePrice(vehicle);
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

    const updateLocation = async () => {
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
        if (error instanceof Error && error.message.includes('Illegal invocation')) {
          const mockLoc = {
            lat: 28.7041 + (Math.random() * 0.001),
            lng: 77.1025 + (Math.random() * 0.001),
            driver: currentUser?.username || 'unknown',
            timestamp: new Date().toISOString(),
            isAvailable: isOnline,
            isLoggedIn: true,
          };
          setDriverLoc(mockLoc);
          return;
        }
        console.error('❌ Error getting location:', error);
      }
    };

    updateLocation();
    locationInterval = setInterval(updateLocation, 5000);

    return () => {
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [currentUser?.username, isOnline]);

  // Send location to socket
  useEffect(() => {
    if (socket && isConnected && driverLoc && driverLoc.lat && driverLoc.lng) {
      socket.emit(SOCKET_EVENTS.EV_DRIVER_LIVE_LOCATION, driverLoc);
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
    };

    socket.on(SOCKET_EVENTS.NEW_RIDE_REQUEST, handleRideRequest);
    socket.on(SOCKET_EVENTS.RIDE_INTIATED_BY_DRIVER, handleRideInitiated);

    return () => {
      socket.off(SOCKET_EVENTS.NEW_RIDE_REQUEST, handleRideRequest);
      socket.off(SOCKET_EVENTS.RIDE_INTIATED_BY_DRIVER, handleRideInitiated);
    };
  }, [socket, isConnected]);

  const handleAcceptRide = (index: number) => {
    const rideInfo = rideRequests[index];
    setLoadingIndex(index);

    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.DRIVER_ACCEPTED_THE_RIDE, rideInfo);
    }
  };

  const handleDeclineRide = (index: number) => {
    setRideRequests(prev => prev.filter((_, i) => i !== index));
  };

  // Determine layout based on state
  // If route is calculated: 60% map, 40% bottom panel
  // If no route: 70% map, 30% bottom panel
  const hasRoute = routeDistance !== null && routeDistance > 0 && fromCoordinates && toCoordinates;
  const mapHeightPercent = hasRoute ? 0.6 : 0.7;
  
  const mapHeightValue = SCREEN_HEIGHT * mapHeightPercent;

  // Bottom sheet snap points: 30%, 70%, 40%
  const snapPoints = useMemo(() => ['30%', '70%', '40%'], []);

  // Determine bottom sheet index based on state (only when not manually controlled)
  useEffect(() => {
    // Don't override if user is actively searching (searchMode is set)
    // The handlers will manage the snap when searchMode is set
    if (searchMode) {
      return; // Let manual snapToIndex handle it
    }
    
    if (isSearchingForRiders || showConfirmation || hasRoute) {
      setBottomSheetIndex(2); // 40% for vehicle/confirm/searching
      bottomSheetRef.current?.snapToIndex(2);
    } else {
      setBottomSheetIndex(0); // 30% default
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [isSearchingForRiders, showConfirmation, hasRoute, searchMode]);

  return (
    <View style={styles.container}>
      {/* Map Section - Top 70% (or 60% when route exists) */}
      <View style={[styles.mapContainer, { height: mapHeightValue }]}>
        {driverLoc ? (
          <ReactNativeMapView
            center={[driverLoc.lng, driverLoc.lat]}
            zoom={14}
            onMapClick={(lng: number, lat: number) => {
              console.log('🗺️ Map clicked:', lng, lat);
            }}
            onRouteCalculated={handleRouteCalculated}
            userLocation={driverLoc ? { lat: driverLoc.lat, lng: driverLoc.lng } : null}
            fromLocation={fromCoordinates ? { lat: fromCoordinates.lat, lng: fromCoordinates.lng, description: fromLocation } : null}
            toLocation={toCoordinates ? { lat: toCoordinates.lat, lng: toCoordinates.lng, description: toLocation } : null}
            style={styles.map}
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <MaterialCommunityIcons name="map-marker-off" size={48} color={THEME.textTertiary} />
            <Text style={styles.mapPlaceholderText}>Waiting for location...</Text>
          </View>
        )}
      </View>

      {/* Bottom Sheet - Positioned absolutely at bottom */}
      <View style={styles.bottomSheetContainer}>
        <RideBottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          index={bottomSheetIndex}
          onChange={setBottomSheetIndex}
          enablePanDownToClose={false}
        >
        {searchMode ? (
          // Search Modal
          <SearchModal
            title={searchMode === 'from' ? 'Pickup Location' : 'Drop Location'}
            placeholder={searchMode === 'from' ? 'Pickup point' : 'Drop location'}
            onPlaceSelected={searchMode === 'from' ? handleFromPlaceSelected : handleToPlaceSelected}
            onClose={() => {
              setSearchMode(null);
              setTimeout(() => {
                setBottomSheetIndex(0);
                bottomSheetRef.current?.snapToIndex(0);
              }, 100);
            }}
            icon={searchMode === 'from' ? 'map-marker' : 'map-marker-check'}
            searchHistory={searchHistory}
          />
        ) : isSearchingForRiders ? (
          // Searching UI
          <SearchingUI onCancel={handleCancelRide} />
        ) : showConfirmation ? (
          // Confirmation Card
          <ConfirmationCard
            fromLocation={fromLocation}
            toLocation={toLocation}
            routeDistance={routeDistance}
            routeDuration={routeDuration}
            selectedVehicle={selectedVehicle!}
            vehicleName={vehicleTypes.find(v => v.id === selectedVehicle)?.name || ''}
            vehicleIcon={vehicleTypes.find(v => v.id === selectedVehicle)?.icon || 'car'}
            price={getFinalPrice()}
            onConfirm={handleConfirmPickup}
            onBack={() => setShowConfirmation(false)}
          />
        ) : hasRoute ? (
          // Vehicle Selection
          <VehicleSelection
            vehicles={vehicleTypes}
            routeDistance={routeDistance}
            selectedVehicle={selectedVehicle}
            onSelect={handleVehicleSelect}
            onBack={handleBackFromVehicleSelection}
          />
        ) : (
          // Default: From/To Inputs
          <View style={styles.defaultInputs}>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={handleFromInputClick}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="map-marker" size={24} color={THEME.primary} />
              <View style={styles.inputContent}>
                <Text variant="labelSmall" style={styles.inputLabel}>From</Text>
                <Text variant="bodyMedium" style={styles.inputText}>
                  {fromLocation || 'Pickup point'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.inputButton}
              onPress={handleToInputClick}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="map-marker-check" size={24} color={THEME.primary} />
              <View style={styles.inputContent}>
                <Text variant="labelSmall" style={styles.inputLabel}>To</Text>
                <Text variant="bodyMedium" style={styles.inputText}>
                  {toLocation || 'Drop location'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        </RideBottomSheet>
      </View>

      {/* Header */}
        {/* <View style={styles.header}>
          {/* <View>
            <Text variant="titleSmall" style={styles.welcomeText}>Welcome back,</Text>
            <Text variant="headlineSmall" style={styles.driverName}>
              {currentUser?.firstName || currentUser?.username || 'Driver'}
            </Text>
          </View> */}
          {/* <View style={styles.headerRight}> */}
          {/* Online Status Toggle */}
          {/* <TouchableOpacity
            onPress={toggleOnlineStatus}
            style={[styles.onlineButton, isOnline && styles.onlineButtonActive]}
          >
            <View style={[styles.onlineDot, isOnline && styles.onlineDotActive]} />
            <Text style={[styles.onlineText, isOnline && styles.onlineTextActive]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity> */}
          
            {/* <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
        <TouchableOpacity
                  style={styles.profileButton}
                  onPress={() => setMenuVisible(true)}
                >
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {(currentUser?.firstName?.[0] || currentUser?.username?.[0] || 'D').toUpperCase()}
              </Text>
          </View>
        </TouchableOpacity>
              }
            >
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                }} 
                title="Profile" 
                leadingIcon="account"
              />
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
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
            </Menu> */}
          {/* </View> */}
        {/* </View> */}


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

      {/* Dialogs */}
        <Portal>
          <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
            <Dialog.Icon icon="logout" size={32} />
            <Dialog.Title style={styles.dialogTitle}>Logout</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={styles.dialogContent}>
                Are you sure you want to logout?
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
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

          <Dialog visible={permissionDialogVisible} onDismiss={() => setPermissionDialogVisible(false)}>
            <Dialog.Icon icon="map-marker-alert" size={32} />
            <Dialog.Title style={styles.dialogTitle}>Permission Required</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={styles.dialogContent}>
                Location permission is required to receive ride requests.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
            <Button onPress={() => setPermissionDialogVisible(false)}>OK</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingTop: 0,
    marginTop: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.background,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    ...Platform.select({
      ios: {
        shadowColor: THEME.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  welcomeText: {
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  driverName: {
    color: THEME.text,
    fontWeight: '700',
    marginTop: -2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  onlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  onlineButtonActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.textSecondary,
    marginRight: 6,
  },
  onlineDotActive: {
    backgroundColor: 'white',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  onlineTextActive: {
    color: 'white',
  },
  profileButton: {
    padding: 4,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mapContainer: {
    width: '100%',
    backgroundColor: THEME.surface,
    marginTop: 0,
    paddingTop: 0,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.surface,
  },
  mapPlaceholderText: {
    marginTop: 12,
    color: THEME.textTertiary,
    fontSize: 14,
  },
  searchButtonOverlay: {
    position: 'absolute',
    bottom: -150,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: THEME.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  searchPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: THEME.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  searchPanelHeader: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchPanelHandle: {
    width: 40,
    height: 4,
    backgroundColor: THEME.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  searchPanelHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  searchPanelTitle: {
    color: THEME.text,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  searchPanelContent: {
    flex: 1,
  },
  searchPanelScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchInputContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: THEME.background,
  },
  searchButtonRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  searchActionButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  clearButton: {
    borderRadius: 12,
    paddingVertical: 4,
    borderColor: THEME.border,
  },
  routeInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: THEME.surface,
    borderRadius: 12,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeInfoText: {
    color: THEME.text,
    fontSize: 14,
    fontWeight: '600',
  },
  historySection: {
    marginTop: 8,
  },
  historyTitle: {
    color: THEME.text,
    fontWeight: '700',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: THEME.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyFrom: {
    color: THEME.text,
    fontWeight: '600',
  },
  historyTo: {
    color: THEME.textSecondary,
    marginTop: 2,
  },
  historyTime: {
    color: THEME.textTertiary,
    marginTop: 4,
    fontSize: 11,
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: THEME.text,
  },
  dialogContent: {
    textAlign: 'center',
    color: THEME.textSecondary,
    lineHeight: 24,
    fontWeight: '500',
  },
  vehicleSelectionSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  vehicleSectionTitle: {
    color: THEME.text,
    fontWeight: '700',
    marginBottom: 16,
    fontSize: 18,
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  vehicleCard: {
    width: '30%',
    minWidth: 100,
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: THEME.shadow,
        shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
    elevation: 2,
  },
    }),
  },
  vehicleCardSelected: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primary + '10',
  },
  vehicleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleIconContainerSelected: {
    backgroundColor: THEME.primary,
  },
  vehicleName: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  vehicleNameSelected: {
    color: THEME.primary,
    fontWeight: '700',
  },
  vehiclePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
  },
  vehiclePriceSelected: {
    color: THEME.primary,
  },
  vehicleSubtext: {
    fontSize: 10,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  bottomPanelContent: {
    flex: 1,
    padding: 16,
  },
  bottomPanelScrollContent: {
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  searchingAnimation: {
    marginBottom: 24,
  },
  searchingText: {
    color: THEME.text,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  searchingSubtext: {
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  confirmationContent: {
    flex: 1,
  },
  confirmationScrollContent: {
    padding: 20,
  },
  confirmationTitle: {
    color: THEME.text,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  confirmationSection: {
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
    backgroundColor: THEME.border,
    marginVertical: 12,
    marginLeft: 24,
  },
  confirmationRouteInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  confirmationRouteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmationRouteText: {
    color: THEME.text,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmationVehicle: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  confirmationVehicleLabel: {
    color: THEME.textSecondary,
    marginBottom: 8,
  },
  confirmationVehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confirmationVehicleName: {
    color: THEME.text,
    fontWeight: '700',
  },
  confirmationPrice: {
    backgroundColor: THEME.primary + '20',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  confirmationPriceLabel: {
    color: THEME.textSecondary,
    marginBottom: 8,
  },
  confirmationPriceAmount: {
    color: THEME.primary,
    fontWeight: '700',
  },
  confirmationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmationCancelButton: {
    flex: 1,
  },
  confirmationConfirmButton: {
    flex: 2,
  },
  defaultInputs: {
    padding: 16,
    gap: 12,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 12,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    color: THEME.textSecondary,
    marginBottom: 4,
  },
  inputText: {
    color: THEME.text,
    fontWeight: '600',
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    pointerEvents: 'box-none',
  },
});

export default ViewSummaryScreen;
