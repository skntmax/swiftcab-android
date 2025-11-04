import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clearAuthData as clearStoredAuthData, saveAuthData } from '../../../utils/storage';
import { authApi } from '../../api/authApi';

// Types for auth state
export interface User {
  id?: string;
  username?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  avatar?: string | null;
  roleTypeName?: string;
  rating?: number;
  isVerified?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  userType?: number;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLoginPhone: string | null;
  onboardingComplete: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastLoginPhone: null,
  onboardingComplete: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Manual auth actions
    setCredentials: (state, action: PayloadAction<{ user: User; token: string; refreshToken?: string }>) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken || null;
      state.isAuthenticated = true;
      state.error = null;
      
      // Save to AsyncStorage
      saveAuthData({
        token,
        user: {
          username: user.username || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          avatar: user.avatar || user.profilePicture || null,
          roleTypeName: user.roleTypeName || '',
        },
      }).catch(err => console.error('Failed to save auth data:', err));
    },

    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },

    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.onboardingComplete = false;
      
      // Clear from AsyncStorage
      clearStoredAuthData().catch(err => console.error('Failed to clear auth data:', err));
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    setLastLoginPhone: (state, action: PayloadAction<string>) => {
      state.lastLoginPhone = action.payload;
    },

    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.onboardingComplete = action.payload;
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Driver Login
    builder
      .addMatcher(authApi.endpoints.driverLogin.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.driverLogin.matchFulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data?.user && action.payload.data?.token) {
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.isAuthenticated = true;
        }
        state.lastLoginPhone = action.meta.arg.originalArgs.phone;
      })
      .addMatcher(authApi.endpoints.driverLogin.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      });

    // Email/Password Login
    builder
      .addMatcher(authApi.endpoints.emailLogin.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.emailLogin.matchFulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          const responseData = action.payload.data;
          const token = responseData.token;
          const usersObj = responseData.usersObj;
          
          if (token && usersObj) {
            state.token = token;
            state.user = {
              username: usersObj.username,
              firstName: usersObj.firstName || '',
              lastName: usersObj.lastName || '',
              avatar: usersObj.avatar,
              roleTypeName: usersObj.roleTypeName,
            };
            state.isAuthenticated = true;
            state.onboardingComplete = true; // Email login users are already registered
            
            // Save to AsyncStorage
            saveAuthData({
              token,
              user: {
                username: usersObj.username,
                firstName: usersObj.firstName || '',
                lastName: usersObj.lastName || '',
                avatar: usersObj.avatar,
                roleTypeName: usersObj.roleTypeName,
              },
            }).catch(err => console.error('Failed to save auth data:', err));
          }
        }
      })
      .addMatcher(authApi.endpoints.emailLogin.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Email login failed';
      });

    // Verify OTP
    builder
      .addMatcher(authApi.endpoints.verifyOtp.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.verifyOtp.matchFulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          // Handle new API response format: { data: { token, usersObj } }
          const responseData = action.payload.data;
          const token = responseData.token;
          const usersObj = responseData.usersObj;
          
          if (token && usersObj) {
            state.token = token;
            state.user = {
              username: usersObj.username,
              firstName: usersObj.firstName || '',
              lastName: usersObj.lastName || '',
              avatar: usersObj.avatar,
              roleTypeName: usersObj.roleTypeName,
            };
            state.isAuthenticated = true;
            
            // Save to AsyncStorage
            saveAuthData({
              token,
              user: {
                username: usersObj.username,
                firstName: usersObj.firstName || '',
                lastName: usersObj.lastName || '',
                avatar: usersObj.avatar,
                roleTypeName: usersObj.roleTypeName,
              },
            }).catch(err => console.error('Failed to save auth data:', err));
            
            // Check if user is new for onboarding
            if (action.payload.data.isNewUser) {
              state.onboardingComplete = false;
            } else {
              state.onboardingComplete = true;
            }
          }
        }
      })
      .addMatcher(authApi.endpoints.verifyOtp.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'OTP verification failed';
      });

    // Logout
    builder
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.onboardingComplete = false;
        
        // Clear from AsyncStorage
        clearStoredAuthData().catch(err => console.error('Failed to clear auth data:', err));
      });

    // Get Current User
    builder
      .addMatcher(authApi.endpoints.getCurrentUser.matchFulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
        }
      });
  },
});

export const {
  setCredentials,
  setToken,
  clearAuth,
  setError,
  clearError,
  setLastLoginPhone,
  setOnboardingComplete,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectLastLoginPhone = (state: { auth: AuthState }) => state.auth.lastLoginPhone;
export const selectOnboardingComplete = (state: { auth: AuthState }) => state.auth.onboardingComplete;
