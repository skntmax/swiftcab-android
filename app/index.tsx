import OnboardingFlowScreen from '@/components/onboarding/OnboardingFlowScreen';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setCredentials } from './lib/reducers/auth/authSlice';
import { CONSTANTS } from './utils/const';
import { getAuthData } from './utils/storage';

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user is already logged in
      const authData = await getAuthData();
      
      if (authData && authData.token) {
        // User is logged in, restore their session
        dispatch(setCredentials({
          token: authData.token,
          user: {
            username: authData.user.username,
            firstName: authData.user.firstName,
            lastName: authData.user.lastName,
            avatar: authData.user.avatar,
            roleTypeName: authData.user.roleTypeName,
          },
        }));
        
        // Redirect to dashboard (ViewSummaryScreen)
        setTimeout(() => {
          router.replace('/(drawer)/(tabs)');
        }, 500);
      } else {
        // No saved login, show onboarding
        setIsChecking(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // On error, show onboarding
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CONSTANTS.theme.primaryColor} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <OnboardingFlowScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

