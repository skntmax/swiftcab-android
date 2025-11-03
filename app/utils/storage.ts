/**
 * AsyncStorage utility for persisting app data
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@swiftcab:auth_token',
  USER_DATA: '@swiftcab:user_data',
  ONBOARDING_COMPLETE: '@swiftcab:onboarding_complete',
} as const;

export interface StoredUserData {
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  roleTypeName: string;
}

export interface StoredAuthData {
  token: string;
  user: StoredUserData;
}

/**
 * Save authentication data to storage
 */
export const saveAuthData = async (data: StoredAuthData): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, data.token],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(data.user)],
    ]);
  } catch (error) {
    console.error('Failed to save auth data:', error);
    throw error;
  }
};

/**
 * Get authentication data from storage
 */
export const getAuthData = async (): Promise<StoredAuthData | null> => {
  try {
    const [[, token], [, userData]] = await AsyncStorage.multiGet([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);

    if (!token || !userData) {
      return null;
    }

    return {
      token,
      user: JSON.parse(userData),
    };
  } catch (error) {
    console.error('Failed to get auth data:', error);
    return null;
  }
};

/**
 * Clear authentication data from storage
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.ONBOARDING_COMPLETE,
    ]);
  } catch (error) {
    console.error('Failed to clear auth data:', error);
    throw error;
  }
};

/**
 * Save onboarding completion status
 */
export const saveOnboardingComplete = async (complete: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.ONBOARDING_COMPLETE,
      JSON.stringify(complete)
    );
  } catch (error) {
    console.error('Failed to save onboarding status:', error);
    throw error;
  }
};

/**
 * Check if onboarding is complete
 */
export const isOnboardingComplete = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value ? JSON.parse(value) : false;
  } catch (error) {
    console.error('Failed to get onboarding status:', error);
    return false;
  }
};

/**
 * Get only the auth token
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

