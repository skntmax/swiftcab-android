/**
 * Centralized API Routes Configuration
 * All API endpoints are defined here for easy management
 */

// Base API version
const API_VERSION = 'v1';

// Authentication Routes
export const AUTH_ROUTES = {
  LOGIN: `/${API_VERSION}/auth/login`,
  VERIFY_OTP: `/${API_VERSION}/auth/verify-otp`,
  LOGOUT: `/${API_VERSION}/auth/logout`,
  REFRESH_TOKEN: `/${API_VERSION}/auth/refresh-token`,
  ME: `/${API_VERSION}/auth/me`,
  RESEND_OTP: `/${API_VERSION}/auth/resend-otp`,
  FORGOT_PASSWORD: `/${API_VERSION}/auth/forgot-password`,
  RESET_PASSWORD: `/${API_VERSION}/auth/reset-password`,
} as const;

// Driver/User Management Routes
export const USER_ROUTES = {
  PROFILE: `/${API_VERSION}/driver/profile`,
  UPDATE_PROFILE: `/${API_VERSION}/driver/profile`,
  CHANGE_PASSWORD: `/${API_VERSION}/driver/change-password`,
  UPLOAD_AVATAR: `/${API_VERSION}/driver/upload-avatar`,
  DELETE_ACCOUNT: `/${API_VERSION}/driver/delete-account`,
} as const;

// Document Management Routes
export const DOCUMENT_ROUTES = {
  UPLOAD: `/${API_VERSION}/driver/documents/upload`,
  LIST: `/${API_VERSION}/driver/documents`,
  DELETE: `/${API_VERSION}/driver/documents`,
  STATUS: `/${API_VERSION}/driver/documents/status`,
  VERIFY: `/${API_VERSION}/driver/documents/verify`,
} as const;

// File Upload Routes  
export const UPLOAD_ROUTES = {
  S3_PRESIGNED_URL: `/${API_VERSION}/master/upload-to-s3`,
  GET_FILE_URL: `/${API_VERSION}/master/get-uploaded-file`,
  DELETE_FILE: `/${API_VERSION}/master/delete-file`,
} as const;

// Earnings & Finance Routes
export const EARNINGS_ROUTES = {
  DAILY: `/${API_VERSION}/driver/earnings/daily`,
  WEEKLY: `/${API_VERSION}/driver/earnings/weekly`, 
  MONTHLY: `/${API_VERSION}/driver/earnings/monthly`,
  YEARLY: `/${API_VERSION}/driver/earnings/yearly`,
  SUMMARY: `/${API_VERSION}/driver/earnings/summary`,
  PAYMENT_HISTORY: `/${API_VERSION}/driver/payments/history`,
  WITHDRAW: `/${API_VERSION}/driver/payments/withdraw`,
} as const;

// Rides Management Routes
export const RIDES_ROUTES = {
  ACTIVE: `/${API_VERSION}/driver/rides/active`,
  HISTORY: `/${API_VERSION}/driver/rides/history`,
  UPCOMING: `/${API_VERSION}/driver/rides/upcoming`,
  COMPLETED: `/${API_VERSION}/driver/rides/completed`,
  CANCELLED: `/${API_VERSION}/driver/rides/cancelled`,
  ACCEPT: `/${API_VERSION}/driver/rides/accept`,
  REJECT: `/${API_VERSION}/driver/rides/reject`,
  START: `/${API_VERSION}/driver/rides/start`,
  COMPLETE: `/${API_VERSION}/driver/rides/complete`,
  CANCEL: `/${API_VERSION}/driver/rides/cancel`,
} as const;

// Driver Status Routes
export const STATUS_ROUTES = {
  ONLINE: `/${API_VERSION}/driver/status/online`,
  OFFLINE: `/${API_VERSION}/driver/status/offline`,
  CURRENT_STATUS: `/${API_VERSION}/driver/status`,
  UPDATE_LOCATION: `/${API_VERSION}/driver/location`,
} as const;

// Master Data Routes
export const MASTER_ROUTES = {
  CITIES: `/${API_VERSION}/master/cities`,
  VEHICLE_TYPES: `/${API_VERSION}/master/vehicle-types`,
  BANKS: `/${API_VERSION}/master/banks`,
  BANK_BRANCHES: `/${API_VERSION}/master/bank-branches`,
  AREAS: `/${API_VERSION}/master/areas`,
  FARE_CALCULATOR: `/${API_VERSION}/master/fare-calculator`,
} as const;

// Notifications Routes
export const NOTIFICATION_ROUTES = {
  LIST: `/${API_VERSION}/driver/notifications`,
  MARK_READ: `/${API_VERSION}/driver/notifications/read`,
  MARK_ALL_READ: `/${API_VERSION}/driver/notifications/read-all`,
  DELETE: `/${API_VERSION}/driver/notifications`,
  SETTINGS: `/${API_VERSION}/driver/notifications/settings`,
} as const;

// Support Routes
export const SUPPORT_ROUTES = {
  CONTACT: `/${API_VERSION}/support/contact`,
  TICKETS: `/${API_VERSION}/support/tickets`,
  FAQ: `/${API_VERSION}/support/faq`,
  HELP_CENTER: `/${API_VERSION}/support/help-center`,
} as const;

// Bank & Payment Routes
export const BANK_ROUTES = {
  ACCOUNT_INFO: `/${API_VERSION}/driver/bank/account`,
  UPDATE_ACCOUNT: `/${API_VERSION}/driver/bank/account`,
  VERIFY_ACCOUNT: `/${API_VERSION}/driver/bank/verify`,
  TRANSACTION_HISTORY: `/${API_VERSION}/driver/bank/transactions`,
} as const;

// Vehicle Management Routes
export const VEHICLE_ROUTES = {
  INFO: `/${API_VERSION}/driver/vehicle`,
  UPDATE: `/${API_VERSION}/driver/vehicle`,
  INSURANCE: `/${API_VERSION}/driver/vehicle/insurance`,
  DOCUMENTS: `/${API_VERSION}/driver/vehicle/documents`,
} as const;

// Rating & Reviews Routes
export const RATING_ROUTES = {
  MY_RATINGS: `/${API_VERSION}/driver/ratings`,
  RATE_CUSTOMER: `/${API_VERSION}/driver/ratings/customer`,
  RATING_SUMMARY: `/${API_VERSION}/driver/ratings/summary`,
} as const;

// Analytics Routes
export const ANALYTICS_ROUTES = {
  DASHBOARD: `/${API_VERSION}/driver/analytics/dashboard`,
  PERFORMANCE: `/${API_VERSION}/driver/analytics/performance`,
  TRENDS: `/${API_VERSION}/driver/analytics/trends`,
} as const;

// All routes combined for easy access
export const ALL_ROUTES = {
  AUTH: AUTH_ROUTES,
  USER: USER_ROUTES,
  DOCUMENTS: DOCUMENT_ROUTES,
  UPLOADS: UPLOAD_ROUTES,
  EARNINGS: EARNINGS_ROUTES,
  RIDES: RIDES_ROUTES,
  STATUS: STATUS_ROUTES,
  MASTER: MASTER_ROUTES,
  NOTIFICATIONS: NOTIFICATION_ROUTES,
  SUPPORT: SUPPORT_ROUTES,
  BANK: BANK_ROUTES,
  VEHICLE: VEHICLE_ROUTES,
  RATING: RATING_ROUTES,
  ANALYTICS: ANALYTICS_ROUTES,
} as const;

export default ALL_ROUTES;
