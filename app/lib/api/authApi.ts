import urls from "@/app/utils/urls";
import { baseApi, LoginRequest, LoginResponse, VerifyOtpRequest, VerifyOtpResponse } from './baseApi';

// Email/Password Login Request
export interface EmailLoginRequest {
  emailOrUsername: string;
  password: string;
  userType: number; // 22 for driver-partner
}

// Email/Password Login Response (same as OTP login)
export interface EmailLoginResponse {
  data: {
    token: string;
    usersObj: {
      username: string;
      firstName?: string;
      lastName?: string;
      avatar?: string | null;
      roleTypeName: string;
    };
  };
  message: string;
  status: number;
  error: boolean;
}

// Authentication API endpoints
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Driver Login/Signup - Based on your curl request (Phone/OTP)
    driverLogin: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: urls.auth_login,
        method: 'POST',
        body: {
          phone: credentials.phone,
          userType: credentials.userType || 22, // 22 for drivers
        },
      }),
      invalidatesTags: ['Auth'],
    }),

    // Email/Password Login - New endpoint
    emailLogin: builder.mutation<EmailLoginResponse, EmailLoginRequest>({
      query: (credentials) => ({
        url: urls.auth_login,
        method: 'POST',
        body: {
          emailOrUsername: credentials.emailOrUsername,
          password: credentials.password,
          userType: 22, // Static value for driver-partner
        },
      }),
      invalidatesTags: ['Auth'],
    }),

    // Verify OTP - Based on your curl request
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (otpData) => ({
        url: urls.auth_verify_otp,
        method: 'POST',
        body: {
          otp: otpData.otp,
          phone: otpData.phone,
        },
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Logout
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/v1/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Refresh Token
    refreshToken: builder.mutation<LoginResponse, { refreshToken: string }>({
      query: (data) => ({
        url: '/v1/auth/refresh-token',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Get Current User Profile
    getCurrentUser: builder.query<any, void>({
      query: () => '/v1/auth/me',
      providesTags: ['User'],
    }),

    // Resend OTP
    resendOtp: builder.mutation<LoginResponse, { phone: string }>({
      query: (data) => ({
        url: '/v1/auth/resend-otp',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

// Export hooks for use in components
export const {
  useDriverLoginMutation,
  useEmailLoginMutation,
  useVerifyOtpMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useResendOtpMutation,
} = authApi;

export default authApi;
