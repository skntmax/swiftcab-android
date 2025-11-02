/**
 * Centralized API Hooks Export
 * Import all API hooks from this single file
 */

// Base API
export { baseApi } from './baseApi';

// Authentication API
export {
  useDriverLoginMutation, useGetCurrentUserQuery, useLogoutMutation,
  useRefreshTokenMutation, useResendOtpMutation, useVerifyOtpMutation
} from './authApi';

// Driver Profile & Documents API
export {
  useDeleteDocumentMutation,
  useGetBankAccountQuery, useGetBankBranchesQuery, useGetBanksQuery, useGetCitiesQuery, useGetDocumentsQuery,
  useGetDocumentStatusQuery, useGetProfileQuery, useGetS3PresignedUrlMutation,
  useGetUploadedFileUrlQuery, useGetVehicleTypesQuery, useLazyGetBankBranchesQuery, useUpdateBankAccountMutation, useUpdateProfileMutation,
  useUploadDocumentMutation
} from './driverApi';

// Earnings & Rides API
export {
  useAcceptRideMutation, useCancelRideMutation, useCompleteRideMutation, useGetActiveRidesQuery, useGetCancelledRidesQuery, useGetCompletedRidesQuery, useGetDailyEarningsQuery, useGetEarningsSummaryQuery, useGetMonthlyEarningsQuery, useGetPaymentHistoryQuery, useGetRideHistoryQuery,
  useGetUpcomingRidesQuery, useGetWeeklyEarningsQuery, useRejectRideMutation,
  useStartRideMutation
} from './earningsApi';

// Routes
export { ALL_ROUTES } from './routes';

// Types
export type {
  ApiError, LoginRequest,
  LoginResponse,
  VerifyOtpRequest,
  VerifyOtpResponse
} from './baseApi';

export type {
  Bank, BankAccount, BankBranch, City, DocumentUpload, DriverProfile, VehicleType
} from './driverApi';

export type {
  DashboardStats, EarningsData, PaymentHistory, Ride
} from './earningsApi';

