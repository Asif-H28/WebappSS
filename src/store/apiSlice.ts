import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { type RootState } from './index.ts';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['SuperAdmin'],
  endpoints: (builder) => ({
    superAdminSignIn: builder.mutation({
      query: (credentials) => ({
        url: '/super-admin/signin',
        method: 'POST',
        body: credentials,
      }),
    }),
    superAdminSignUp: builder.mutation({
      query: (userData) => ({
        url: '/super-admin/signup',
        method: 'POST',
        body: userData,
      }),
    }),
    getSuperAdminProfile: builder.query({
      query: () => '/super-admin/profile',
      providesTags: ['SuperAdmin'],
    }),
  }),
});

export const {
  useSuperAdminSignInMutation,
  useSuperAdminSignUpMutation,
  useGetSuperAdminProfileQuery,
} = apiSlice;
