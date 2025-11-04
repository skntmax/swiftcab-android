import { all_env } from '@/app/utils/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import urls from './../../utils/urls';

const { API_URL } = all_env;
// Define the base API
export const usersApi = createApi({
  reducerPath: 'usersApi',
  tagTypes: ['user-types', 'register-user', 'login-user'],

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    // Uncomment for auth headers
    // prepareHeaders: (headers) => {
    //   headers.set('Authorization', `Bearer ${your_token_here}`);
    //   headers.set('Content-Type', 'application/json');
    //   return headers;
    // },
  }),

  endpoints: (builder) => ({
    getUser: builder.mutation<any, void>({
      query: () => ({
        url: urls.get_role,
        method: 'GET',
      }),
      invalidatesTags: ['user-types'],
    }),

    signupUser: builder.mutation<any, any>({
      query: (body) => ({
        url: 'v1/auth/signup',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['register-user'],
    }),

    loginUser: builder.mutation<any, any>({
      query: (body) => ({
        url: 'v1/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['login-user'],
    }),

      verifyOtp: builder.mutation({ 
        query: (body) => (  {
          url: 'v1/auth/verify-otp',
          method: 'post',
            body:body
        }),
        // providesTags:['verifyOtp']
      },  
      ),
   }),

});

// Export hooks for usage in functional components
export const {
  useGetUserMutation,
  useSignupUserMutation,
  useLoginUserMutation,
  useVerifyOtpMutation
} = usersApi;

export default usersApi;
