import { baseApi } from './baseApi';
import { EARNINGS_ROUTES, RIDES_ROUTES } from './routes';

// Types for earnings and rides
export interface EarningsData {
  totalEarnings: number;
  ridesCompleted: number;
  averageEarning: number;
  date: string;
  breakdown?: {
    fareAmount: number;
    incentives: number;
    tips: number;
    deductions: number;
  };
}

export interface DashboardStats {
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  rating: number;
  onlineHours: number;
}

export interface Ride {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerRating: number;
  pickupAddress: string;
  dropAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropLatitude: number;
  dropLongitude: number;
  fare: number;
  distance: number;
  duration: number;
  status: 'requested' | 'accepted' | 'started' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'online';
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  vehicleType: string;
  otp: string;
}

export interface PaymentHistory {
  id: string;
  type: 'earning' | 'withdrawal' | 'incentive' | 'deduction';
  amount: number;
  description: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

// Earnings & Rides API endpoints
export const earningsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Earnings endpoints
    getDailyEarnings: builder.query<{ data: EarningsData[] }, { date?: string }>({
      query: ({ date }) => ({
        url: EARNINGS_ROUTES.DAILY,
        params: date ? { date } : {},
      }),
      providesTags: ['Earnings'],
    }),

    getWeeklyEarnings: builder.query<{ data: EarningsData[] }, { week?: string }>({
      query: ({ week }) => ({
        url: EARNINGS_ROUTES.WEEKLY,
        params: week ? { week } : {},
      }),
      providesTags: ['Earnings'],
    }),

    getMonthlyEarnings: builder.query<{ data: EarningsData[] }, { month?: string; year?: string }>({
      query: ({ month, year }) => ({
        url: EARNINGS_ROUTES.MONTHLY,
        params: { month, year },
      }),
      providesTags: ['Earnings'],
    }),

    getEarningsSummary: builder.query<{ data: DashboardStats }, void>({
      query: () => EARNINGS_ROUTES.SUMMARY,
      providesTags: ['Earnings'],
    }),

    getPaymentHistory: builder.query<{ data: PaymentHistory[] }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => ({
        url: EARNINGS_ROUTES.PAYMENT_HISTORY,
        params: { page, limit },
      }),
      providesTags: ['Earnings'],
    }),

    // Rides endpoints
    getActiveRides: builder.query<{ data: Ride[] }, void>({
      query: () => RIDES_ROUTES.ACTIVE,
      providesTags: ['Rides'],
    }),

    getRideHistory: builder.query<{ data: Ride[] }, { 
      page?: number; 
      limit?: number; 
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }>({
      query: (params) => ({
        url: RIDES_ROUTES.HISTORY,
        params,
      }),
      providesTags: ['Rides'],
    }),

    getUpcomingRides: builder.query<{ data: Ride[] }, void>({
      query: () => RIDES_ROUTES.UPCOMING,
      providesTags: ['Rides'],
    }),

    getCompletedRides: builder.query<{ data: Ride[] }, { page?: number; limit?: number }>({
      query: (params) => ({
        url: RIDES_ROUTES.COMPLETED,
        params,
      }),
      providesTags: ['Rides'],
    }),

    getCancelledRides: builder.query<{ data: Ride[] }, { page?: number; limit?: number }>({
      query: (params) => ({
        url: RIDES_ROUTES.CANCELLED,
        params,
      }),
      providesTags: ['Rides'],
    }),

    // Ride actions
    acceptRide: builder.mutation<{ success: boolean; data: Ride }, { rideId: string }>({
      query: ({ rideId }) => ({
        url: RIDES_ROUTES.ACCEPT,
        method: 'POST',
        body: { rideId },
      }),
      invalidatesTags: ['Rides'],
    }),

    rejectRide: builder.mutation<{ success: boolean }, { rideId: string; reason?: string }>({
      query: ({ rideId, reason }) => ({
        url: RIDES_ROUTES.REJECT,
        method: 'POST',
        body: { rideId, reason },
      }),
      invalidatesTags: ['Rides'],
    }),

    startRide: builder.mutation<{ success: boolean; data: Ride }, { rideId: string; otp: string }>({
      query: ({ rideId, otp }) => ({
        url: RIDES_ROUTES.START,
        method: 'POST',
        body: { rideId, otp },
      }),
      invalidatesTags: ['Rides', 'Earnings'],
    }),

    completeRide: builder.mutation<{ success: boolean; data: Ride }, { 
      rideId: string; 
      dropLatitude: number; 
      dropLongitude: number;
      finalFare?: number;
    }>({
      query: (data) => ({
        url: RIDES_ROUTES.COMPLETE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Rides', 'Earnings'],
    }),

    cancelRide: builder.mutation<{ success: boolean }, { rideId: string; reason: string }>({
      query: ({ rideId, reason }) => ({
        url: RIDES_ROUTES.CANCEL,
        method: 'POST',
        body: { rideId, reason },
      }),
      invalidatesTags: ['Rides'],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetDailyEarningsQuery,
  useGetWeeklyEarningsQuery,
  useGetMonthlyEarningsQuery,
  useGetEarningsSummaryQuery,
  useGetPaymentHistoryQuery,
  useGetActiveRidesQuery,
  useGetRideHistoryQuery,
  useGetUpcomingRidesQuery,
  useGetCompletedRidesQuery,
  useGetCancelledRidesQuery,
  useAcceptRideMutation,
  useRejectRideMutation,
  useStartRideMutation,
  useCompleteRideMutation,
  useCancelRideMutation,
} = earningsApi;

export default earningsApi;
