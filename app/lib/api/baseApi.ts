import { all_env } from '@/app/utils/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types for authentication
export interface LoginRequest {
  phone: string;
  userType: number; // 22 for drivers
}

export interface LoginResponse {
  success?: boolean;
  message: string;
  status: number;
  error: boolean;
  data?: string | {
    token?: string;
    usersObj?: {
      username: string;
      firstName?: string;
      lastName?: string;
      avatar?: string | null;
      roleTypeName?: string;
    };
  };
}

export interface VerifyOtpRequest {
  otp: string;
  phone: string;
}

export interface VerifyOtpResponse {
  success?: boolean;
  message: string;
  status: number;
  error: boolean;
  data?: {
    token: string;
    usersObj: {
      username: string;
      firstName?: string;
      lastName?: string;
      avatar?: string | null;
      roleTypeName?: string;
    };
  };
}

export interface ApiError {
  status: number;
  data: {
    success: boolean;
    message: string;
    error?: string;
  };
}

// Base API configuration
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: all_env.API_URL,
    prepareHeaders: (headers, { getState }) => {
      // Add common headers
      headers.set('content-type', 'application/json');
      headers.set('User-Agent', 'SwiftCab-Driver-App/1.0.0');
      
      // Get auth token from state if available
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: [
    'Auth', 
    'User', 
    'Documents', 
    'Earnings', 
    'Rides', 
    'Profile',
    'Banks',
    'Cities',
    'VehicleTypes'
  ],
  endpoints: () => ({}),
});

export default baseApi;
