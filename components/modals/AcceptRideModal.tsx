/**
 * AcceptRideModal Component
 * Displays incoming ride requests to the driver
 */

import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    View,
} from 'react-native';
import { ActivityIndicator, Button, Card, Divider, ProgressBar, Text } from 'react-native-paper';

interface RideRequestData {
  customerViewDetails?: {
    correlationId?: string;
    portal?: string;
    pickup_name?: string;
    drop_name?: string;
    pickup_date?: string;
    pickup_time?: string;
    distance?: number;
    travel_way?: string;
  };
  userDetails?: {
    username?: string;
  };
}

interface AcceptRideModalProps {
  open: boolean;
  rideData: RideRequestData;
  onClose: () => void;
  onAccept: () => void;
  loading?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AcceptRideModal({
  open,
  rideData,
  onClose,
  onAccept,
  loading = false,
}: AcceptRideModalProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds countdown

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        
        // If swiped right significantly, close the modal
        if (gesture.dx > SCREEN_WIDTH / 3) {
          dismissModal();
        } else {
          // Spring back to position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // 10-second countdown timer
  useEffect(() => {
    if (!open) return;

    // Reset timer when modal opens
    setTimeLeft(10);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto dismiss
          console.log('⏰ Ride request timeout - auto dismissing');
          dismissModal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const dismissModal = () => {
    Animated.parallel([
      Animated.timing(pan.x, {
        toValue: SCREEN_WIDTH,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onClose();
      // Reset position for next time
      pan.setValue({ x: 0, y: 0 });
      opacity.setValue(1);
      setTimeLeft(10);
    });
  };

  if (!open) return null;

  const customer = rideData?.customerViewDetails || {};
  const user = rideData?.userDetails || {};

  const animatedStyle = {
    transform: pan.getTranslateTransform(),
    opacity,
  };

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      {...panResponder.panHandlers}
    >
      <Card style={styles.card} elevation={5}>
        {/* Header with Timer */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons 
              name="car" 
              size={24} 
              color={CONSTANTS.theme.primaryColor} 
            />
            <Text variant="titleMedium" style={styles.title}>
              🚕 New Ride Request
            </Text>
          </View>
          <View style={styles.timerContainer}>
            <MaterialCommunityIcons 
              name="timer-sand" 
              size={16} 
              color={timeLeft <= 3 ? '#F44336' : CONSTANTS.theme.primaryColor} 
            />
            <Text 
              variant="labelLarge" 
              style={[
                styles.timerText,
                timeLeft <= 3 && styles.timerWarning
              ]}
            >
              {timeLeft}s
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <ProgressBar 
          progress={timeLeft / 10} 
          color={timeLeft <= 3 ? '#F44336' : CONSTANTS.theme.primaryColor}
          style={styles.progressBar}
        />

        <Card.Content style={styles.compactContent}>
          {/* Customer */}
          <InfoRow
            icon="account"
            label="Customer"
            value={user.username || 'Unknown'}
          />
          
          {/* Trip Details */}
          <InfoRow
            icon="map-marker"
            label="Pickup"
            value={customer.pickup_name || 'Not specified'}
            multiline
          />
          <InfoRow
            icon="map-marker-check"
            label="Drop"
            value={customer.drop_name || 'Not specified'}
            multiline
          />
          
          {/* Compact Info */}
          <View style={styles.compactInfo}>
            <View style={styles.compactItem}>
              <MaterialCommunityIcons name="map" size={14} color="#666" />
              <Text variant="bodySmall" style={styles.compactText}>
                {customer.distance ? `${customer.distance.toFixed(1)} km` : 'N/A'}
              </Text>
            </View>
            <View style={styles.compactItem}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
              <Text variant="bodySmall" style={styles.compactText}>
                {customer.pickup_time || 'Not specified'}
              </Text>
            </View>
            <View style={styles.compactItem}>
              <MaterialCommunityIcons name="swap-horizontal" size={14} color="#666" />
              <Text variant="bodySmall" style={styles.compactText}>
                {customer.travel_way === '1' ? 'One Way' : 'Round'}
              </Text>
            </View>
          </View>
        </Card.Content>

        {/* Actions */}
        <Card.Actions style={styles.actions}>
          <Button
            mode="outlined"
            onPress={dismissModal}
            disabled={loading}
            style={styles.declineButton}
            textColor="#666"
          >
            Decline
          </Button>
          <Button
            mode="contained"
            onPress={onAccept}
            disabled={loading}
            style={styles.acceptButton}
            buttonColor={CONSTANTS.theme.primaryColor}
            icon={loading ? undefined : 'check'}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              'Accept'
            )}
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );
}

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  multiline?: boolean;
}

function InfoRow({ icon, label, value, multiline = false }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons
        name={icon as any}
        size={18}
        color={CONSTANTS.theme.primaryColor}
        style={styles.infoIcon}
      />
      <View style={styles.infoContent}>
        <Text variant="labelSmall" style={styles.infoLabel}>
          {label}
        </Text>
        <Text
          variant="bodyMedium"
          style={styles.infoValue}
          numberOfLines={multiline ? undefined : 1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 1000,
    width: 320,
    maxWidth: SCREEN_WIDTH - 32,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: CONSTANTS.theme.primaryColor,
  },
  timerWarning: {
    color: '#F44336',
  },
  progressBar: {
    height: 3,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  compactContent: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  compactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactText: {
    fontSize: 11,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#666',
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    color: '#333',
    fontSize: 13,
  },
  actions: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  declineButton: {
    flex: 1,
  },
  acceptButton: {
    flex: 1,
  },
});

