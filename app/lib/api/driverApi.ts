import { baseApi } from './baseApi';
import { BANK_ROUTES, DOCUMENT_ROUTES, MASTER_ROUTES, USER_ROUTES } from './routes';

// Types for driver API
export interface DriverProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  pincode: string;
  emergencyContact: string;
  profilePicture?: string;
  rating: number;
  isVerified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface DocumentUpload {
  documentType: string;
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountHolderName: string;
  accountType: 'savings' | 'current';
  isVerified: boolean;
}

export interface City {
  id: string;
  name: string;
  state: string;
  isActive: boolean;
}

export interface VehicleType {
  id: string;
  name: string;
  description: string;
  features: string[];
  earnings: string;
  requirements: string[];
  isActive: boolean;
}

export interface Bank {
  id: string;
  bank_name: string;
  isActive: boolean;
}

export interface BankBranch {
  id: string;
  branch_name: string;
  bankId: string;
  ifscCode: string;
  address: string;
}

// Driver API endpoints
export const driverApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Profile Management
    getProfile: builder.query<{ data: DriverProfile }, void>({
      query: () => USER_ROUTES.PROFILE,
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation<{ success: boolean; data: DriverProfile }, Partial<DriverProfile>>({
      query: (profileData) => ({
        url: USER_ROUTES.UPDATE_PROFILE,
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    // Document Management  
    uploadDocument: builder.mutation<{ success: boolean; data: DocumentUpload }, { documentType: string; documentUrl: string }>({
      query: (documentData) => ({
        url: DOCUMENT_ROUTES.UPLOAD,
        method: 'POST',
        body: documentData,
      }),
      invalidatesTags: ['Documents'],
    }),

    getDocuments: builder.query<{ data: DocumentUpload[] }, void>({
      query: () => DOCUMENT_ROUTES.LIST,
      providesTags: ['Documents'],
    }),

    getDocumentStatus: builder.query<{ data: DocumentUpload[] }, void>({
      query: () => DOCUMENT_ROUTES.STATUS,
      providesTags: ['Documents'],
    }),

    deleteDocument: builder.mutation<{ success: boolean }, { documentId: string }>({
      query: ({ documentId }) => ({
        url: `${DOCUMENT_ROUTES.DELETE}/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Documents'],
    }),

    // Bank Account Management
    getBankAccount: builder.query<{ data: BankAccount }, void>({
      query: () => BANK_ROUTES.ACCOUNT_INFO,
      providesTags: ['Profile'],
    }),

    updateBankAccount: builder.mutation<{ success: boolean; data: BankAccount }, Partial<BankAccount>>({
      query: (bankData) => ({
        url: BANK_ROUTES.UPDATE_ACCOUNT,
        method: 'PUT',
        body: bankData,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Master Data
    getCities: builder.query<{ data: City[] }, void>({
      query: () => MASTER_ROUTES.CITIES,
      providesTags: ['Cities'],
    }),

    getVehicleTypes: builder.query<{ data: VehicleType[] }, void>({
      query: () => MASTER_ROUTES.VEHICLE_TYPES,
      providesTags: ['VehicleTypes'],
    }),

    getBanks: builder.query<{ data: Bank[] }, void>({
      query: () => MASTER_ROUTES.BANKS,
      providesTags: ['Banks'],
    }),

    getBankBranches: builder.query<{ data: BankBranch[] }, string>({
      query: (bankId) => `${MASTER_ROUTES.BANK_BRANCHES}?bankId=${bankId}`,
      providesTags: ['Banks'],
    }),

    // Upload file to S3
    getS3PresignedUrl: builder.mutation<string, { fileName: string; contentType: string }>({
      query: (uploadData) => ({
        url: '/v1/master/upload-to-s3',
        method: 'POST',
        body: uploadData,
      }),
    }),

    getUploadedFileUrl: builder.query<string, string>({
      query: (fileName) => `/v1/master/get-uploaded-file/${encodeURIComponent(fileName)}`,
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadDocumentMutation,
  useGetDocumentsQuery,
  useGetDocumentStatusQuery,
  useDeleteDocumentMutation,
  useGetBankAccountQuery,
  useUpdateBankAccountMutation,
  useGetCitiesQuery,
  useGetVehicleTypesQuery,
  useGetBanksQuery,
  useGetBankBranchesQuery,
  useLazyGetBankBranchesQuery,
  useGetS3PresignedUrlMutation,
  useGetUploadedFileUrlQuery,
} = driverApi;

export default driverApi;
