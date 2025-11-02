import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';

// Types for auth state
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  profilePicture?: string;
  rating: number;
  isVerified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  userType: number;
  createdAt: string;
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

    // Verify OTP
    builder
      .addMatcher(authApi.endpoints.verifyOtp.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.verifyOtp.matchFulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.isAuthenticated = true;
          // Check if user is new for onboarding
          if (action.payload.data.isNewUser) {
            state.onboardingComplete = false;
          } else {
            state.onboardingComplete = true;
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
