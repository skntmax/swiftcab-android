import { CONSTANTS } from '@/app/utils/const';
import AppButton from '@/components/ui/Button/Button';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, useTheme } from 'react-native-paper';

type Props = {
  onGranted: (coords: { latitude: number; longitude: number }) => void;
};

const LocationStep: React.FC<Props> = ({ onGranted }) => {
  const theme = useTheme();
  const [status, setStatus] = useState<Location.PermissionStatus | 'unavailable'>('unavailable');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async () => {
    setError(null);
    setLoading(true);
    try {
      const { status: askStatus } = await Location.requestForegroundPermissionsAsync();
      setStatus(askStatus);
      if (askStatus === 'granted') {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        onGranted({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      } else if (askStatus === 'denied') {
        setError('Location permission is required to continue.');
      } else if (askStatus === 'undetermined') {
        setError('Please grant location access to proceed.');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to get location.');
    } finally {
      setLoading(false);
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Enable Location</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        We use your location to verify your account and help riders find you accurately.
      </Text>

      <AppButton
        label={loading ? 'Requesting...' : 'Allow Location Access'}
        onPress={requestPermission}
        loading={loading}
        color={CONSTANTS.theme.primaryColor}
        style={styles.primaryButton}
      />

      {status === 'denied' && (
        <Button mode="outlined" onPress={openSettings} style={styles.secondaryButton}>
          Open Settings
        </Button>
      )}

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
  },
  primaryButton: {
    borderRadius: 24,
  },
  secondaryButton: {
    marginTop: 8,
  },
});

export default LocationStep;



