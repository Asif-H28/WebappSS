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
  tagTypes: ['SuperAdmin', 'AppVersions', 'LicenseRequests', 'Organization'],
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
    getAppVersions: builder.query<any[], void>({
      query: () => '/super-admin/app',
      transformResponse: (response: any) => {
        return Array.isArray(response) ? response : (response.data || response.versions || []);
      },
      providesTags: ['AppVersions'],
    }),
    createAppVersion: builder.mutation({
      query: (data) => ({
        url: '/super-admin/app',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AppVersions'],
    }),
    updateAppVersion: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/super-admin/app/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AppVersions'],
    }),
    deleteAppVersion: builder.mutation({
      query: (id) => ({
        url: `/super-admin/app/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AppVersions'],
    }),
    getLicenseRequests: builder.query<any[], void>({
      query: () => '/license-request',
      transformResponse: (response: any) => {
        return Array.isArray(response) ? response : (response.data || []);
      },
      providesTags: ['LicenseRequests'],
    }),
    updateLicenseRequest: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/license-request/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['LicenseRequests'],
    }),
    getOrganization: builder.query<any, string>({
      query: (orgId) => `/super-admin/app/org/${orgId}`,
      transformResponse: (response: any) => response.data,
      providesTags: (_result, _error, orgId) => [{ type: 'Organization', id: orgId }],
    }),
    toggleOrganizationStatus: builder.mutation({
      query: ({ orgId, isActive }) => ({
        url: `/super-admin/app/org/${orgId}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: (_result, _error, { orgId }) => [{ type: 'Organization', id: orgId }],
    }),
  }),
});

export const {
  useSuperAdminSignInMutation,
  useSuperAdminSignUpMutation,
  useGetSuperAdminProfileQuery,
  useGetAppVersionsQuery,
  useCreateAppVersionMutation,
  useUpdateAppVersionMutation,
  useDeleteAppVersionMutation,
  useGetLicenseRequestsQuery,
  useUpdateLicenseRequestMutation,
  useGetOrganizationQuery,
  useToggleOrganizationStatusMutation,
} = apiSlice;
