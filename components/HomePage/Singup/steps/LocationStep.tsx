import { CONSTANTS } from '@/app/utils/const';
import AppButton from '@/components/ui/Button/Button';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, useTheme } from 'react-native-paper';

type Props = {
  onGranted: (coords: { latitude: number; longitude: number }) => void;
};

const LocationStep: React.FC<Props> = ({ onGranted }) => {
  const theme = useTheme();
  const [status, setStatus] = useState<Location.PermissionStatus | 'unavailable'>('unavailable');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestWebLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let message = 'Unable to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  const requestPermission = async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Handle web platform differently
      if (Platform.OS === 'web') {
        try {
          const coords = await requestWebLocation();
          onGranted(coords);
        } catch (webError: any) {
          if (webError.message.includes('denied')) {
            setError('Location access was blocked. Please enable location access in your browser settings.');
            // Show instructions for enabling location on web
            Alert.alert(
              'Enable Location Access',
              'To use this feature:\n\n1. Click the location icon (🔒) in your browser address bar\n2. Select "Allow" for location access\n3. Refresh the page and try again',
              [{ text: 'OK' }]
            );
          } else {
            setError(webError.message || 'Failed to get location on web');
          }
        }
      } else {
        // Handle mobile platforms (Android/iOS)
        const { status: askStatus } = await Location.requestForegroundPermissionsAsync();
        setStatus(askStatus);
        
        if (askStatus === 'granted') {
          const position = await Location.getCurrentPositionAsync({ 
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000,
          });
          onGranted({ 
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude 
          });
        } else if (askStatus === 'denied') {
          setError('Location permission is required to continue. Please enable location access in settings.');
        } else if (askStatus === 'undetermined') {
          setError('Please grant location access to proceed.');
        }
      }
    } catch (e: any) {
      console.error('Location error:', e);
      setError(e?.message || 'Failed to get location.');
    } finally {
      setLoading(false);
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Browser Settings',
        'To enable location access:\n\n1. Click the location icon (🔒) in your address bar\n2. Select "Allow" for location\n3. Refresh the page',
        [{ text: 'OK' }]
      );
    } else if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const skipForDemo = () => {
    // For demo purposes, use default Mumbai coordinates
    Alert.alert(
      'Demo Mode',
      'Using demo location (Mumbai) for testing purposes.',
      [
        {
          text: 'Continue',
          onPress: () => onGranted({ latitude: 19.0760, longitude: 72.8777 }),
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Enable Location</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        {Platform.OS === 'web' 
          ? 'We need your location to verify your account and connect you with nearby customers. Your browser will ask for permission.'
          : 'We use your location to verify your account and help riders find you accurately.'
        }
      </Text>

      {Platform.OS === 'web' && (
        <Text variant="bodySmall" style={styles.webInstructions}>
          💡 If location is blocked, click the location icon (🔒) in your browser address bar and select "Allow"
        </Text>
      )}

      <AppButton
        label={loading ? 'Getting Location...' : 'Allow Location Access'}
        onPress={requestPermission}
        loading={loading}
        color={CONSTANTS.theme.primaryColor}
        style={styles.primaryButton}
      />

      {(status === 'denied' || error?.includes('denied') || error?.includes('blocked')) && (
        <Button mode="outlined" onPress={openSettings} style={styles.secondaryButton}>
          {Platform.OS === 'web' ? 'Help with Browser Settings' : 'Open Settings'}
        </Button>
      )}

      {/* Demo Skip Button for Testing */}
      <Button 
        mode="text" 
        onPress={skipForDemo} 
        style={styles.skipButton}
        textColor="#999"
      >
        Skip for Demo (Testing Only)
      </Button>

      <HelperText type={error ? 'error' : 'info'} visible={!!error}>
        {error}
      </HelperText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    marginBottom: 6,
  },
  subtitle: {
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  webInstructions: {
    color: '#4CAF50',
    marginBottom: 16,
    backgroundColor: '#F1F8E9',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryButton: {
    borderRadius: 24,
    marginBottom: 8,
  },
  secondaryButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  skipButton: {
    marginTop: 16,
    marginBottom: 8,
  },
});

export default LocationStep;



