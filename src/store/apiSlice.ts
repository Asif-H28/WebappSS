import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './baseQuery.ts';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: customBaseQuery,
  tagTypes: ['SuperAdmin', 'AppVersions', 'LicenseRequests', 'Organization', 'GlobalConfig', 'Tickets', 'Admissions'],
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
        const data = response?.data || response?.versions || response;
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object' && (data.version || data.downloadUrl)) {
          return [data];
        }
        return [];
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
    getOrganizations: builder.query<any[], void>({
      query: () => '/super-admin/app/org/all',
      transformResponse: (response: any) => response.data || response,
      providesTags: (result) => 
        result 
          ? [...result.map(({ orgId }: any) => ({ type: 'Organization' as const, id: orgId })), 'Organization']
          : ['Organization'],
    }),
    getGlobalConfigs: builder.query<any[], void>({
      query: () => '/super-admin/config',
      transformResponse: (response: any) => response.data || response,
      providesTags: ['GlobalConfig'],
    }),
    updateGlobalConfig: builder.mutation({
      query: (data) => ({
        url: '/super-admin/config',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GlobalConfig'],
    }),
    getTickets: builder.query<any, void>({
      query: () => '/support/org/all/tickets?all=true',
      transformResponse: (response: any) => response.tickets || [],
      providesTags: ['Tickets'],
    }),
    updateTicketStatus: builder.mutation({
      query: ({ ticketId, status, orgId }) => ({
        url: `/support/ticket/${ticketId}/status`,
        method: 'PATCH',
        body: { status, orgId },
      }),
      invalidatesTags: ['Tickets'],
    }),

    // --- ORG ADMIN AUTH ---
    orgAdminLogin: builder.mutation({
      query: (credentials) => ({
        url: '/org/admin/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    forgotPasswordRequestOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    verifyOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    registerSupportStaff: builder.mutation<any, any>({
      query: (data) => ({
        url: '/support-staff/register',
        method: 'POST',
        body: data,
      }),
    }),
    webDashboardLogin: builder.mutation<any, any>({
      query: (data) => ({
        url: '/web-dashboard/login',
        method: 'POST',
        body: data,
      }),
    }),
    getAdmissionStats: builder.query<any, void>({
      query: () => '/admissions/stats',
      providesTags: ['Admissions'],
    }),
    getAdmissions: builder.query<any, { status?: string, classAppliedFor?: string, search?: string }>({
      query: (params) => {
        let url = '/admissions';
        if (params && Object.keys(params).length > 0) {
           const queryStr = new URLSearchParams(params as any).toString();
           url += `?${queryStr}`;
        }
        return url;
      },
      providesTags: ['Admissions'],
    }),
    getAdmissionById: builder.query<any, string>({
      query: (id) => `/admissions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Admissions' as const, id }],
    }),
    createAdmission: builder.mutation<any, any>({
      query: (data) => ({
        url: '/admissions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admissions'],
    }),
    updateAdmissionStatus: builder.mutation<any, { id: string, payload: any }>({
      query: ({ id, payload }) => ({
        url: `/admissions/${id}/status`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Admissions' as const, id }, 'Admissions'],
    }),
    addAdmissionNote: builder.mutation<any, { id: string, note: string }>({
      query: ({ id, note }) => ({
        url: `/admissions/${id}/notes`,
        method: 'POST',
        body: { note },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Admissions' as const, id }],
    }),
    deleteAdmission: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admissions'],
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
  useGetOrganizationsQuery,
  useToggleOrganizationStatusMutation,
  useGetGlobalConfigsQuery,
  useUpdateGlobalConfigMutation,
  useGetTicketsQuery,
  useUpdateTicketStatusMutation,
  useOrgAdminLoginMutation,
  useForgotPasswordRequestOTPMutation,
  useVerifyOTPMutation,
  useResetPasswordMutation,
  useRegisterSupportStaffMutation,
  useWebDashboardLoginMutation,
  useGetAdmissionStatsQuery,
  useGetAdmissionsQuery,
  useGetAdmissionByIdQuery,
  useCreateAdmissionMutation,
  useUpdateAdmissionStatusMutation,
  useAddAdmissionNoteMutation,
  useDeleteAdmissionMutation,
} = apiSlice;
