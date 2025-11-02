import urls from "@/app/utils/urls";
import { baseApi, LoginRequest, LoginResponse, VerifyOtpRequest, VerifyOtpResponse } from './baseApi';

// Authentication API endpoints
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Driver Login/Signup - Based on your curl request
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
  useVerifyOtpMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useResendOtpMutation,
} = authApi;

export default authApi;
