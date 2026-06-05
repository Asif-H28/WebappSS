import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './baseQuery.ts';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: customBaseQuery,
  tagTypes: ['SuperAdmin', 'AppVersions', 'LicenseRequests', 'Organization', 'GlobalConfig', 'Tickets', 'Admissions', 'Library', 'LessonVideos', 'FeatureFlags', 'OrgDetails', 'Transport', 'AdminNotices'],
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
      transformResponse: (response: any) => response.organizations || response.data || response,
      providesTags: (result) => 
        Array.isArray(result) 
          ? [...result.map(({ orgId }: any) => ({ type: 'Organization' as const, id: orgId })), 'Organization']
          : ['Organization'],
    }),
    getOrganizationStats: builder.query<any, string>({
      query: (orgId) => `/super-admin/app/org/${orgId}/stats`,
      transformResponse: (response: any) => response.data,
      providesTags: (_result, _error, orgId) => [{ type: 'Organization' as const, id: `STATS_${orgId}` }],
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
    createFeatureFlagDefinition: builder.mutation({
      query: (data) => ({
        url: '/feature-flags/definition',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FeatureFlags'],
    }),
    getFeatureFlagDefinitions: builder.query<any, void>({
      query: () => '/feature-flags/definition',
      transformResponse: (response: any) => response.data || response,
      providesTags: ['FeatureFlags'],
    }),
    toggleFeatureFlagForOrg: builder.mutation({
      query: ({ orgId, featureKey, isEnabled }) => ({
        url: `/feature-flags/org/${orgId}/toggle`,
        method: 'POST',
        body: { featureKey, isEnabled },
      }),
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
      providesTags: (_result, _error, id) => [{ type: 'Admissions' as const, id }],
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
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Admissions' as const, id }, 'Admissions'],
    }),
    addAdmissionNote: builder.mutation<any, { id: string, note: string }>({
      query: ({ id, note }) => ({
        url: `/admissions/${id}/notes`,
        method: 'POST',
        body: { note },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Admissions' as const, id }],
    }),
    deleteAdmission: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admissions'],
    }),
    getClassroomList: builder.query<any, string>({
      query: (orgId) => `/classroom/list/${orgId}`,
    }),
    getStudentNamesByClass: builder.query<any, string>({
      query: (classId) => `/student/class/${classId}/names`,
    }),
    getLibraryIssues: builder.query<any, { status?: string, search?: string }>({
      query: (params) => {
        let url = '/library/issues';
        if (params && Object.keys(params).length > 0) {
           const queryStr = new URLSearchParams(params as any).toString();
           url += `?${queryStr}`;
        }
        return url;
      },
      providesTags: ['Library'],
    }),
    issueBook: builder.mutation<any, any>({
      query: (data) => ({
        url: '/library/issue',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Library'],
    }),
    returnBook: builder.mutation<any, string>({
      query: (issueId) => ({
        url: `/library/issue/${issueId}/return`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Library'],
    }),
    deleteLibraryIssue: builder.mutation<any, string>({
      query: (issueId) => ({
        url: `/library/issue/${issueId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Library'],
    }),
    getClassroomsWithSubjects: builder.query<any, string>({
      query: (orgId) => `/classroom/org/${orgId}`,
    }),
    getLessonVideos: builder.query<any, { orgId: string, classId?: string, subjectId?: string, lessonId?: string, videoType?: string }>({
      query: ({ orgId, ...params }) => {
        let url = `/lesson-video/org/${orgId}`;
        const queryParams: Record<string, string> = {};
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            queryParams[key] = String(value);
          }
        });
        if (Object.keys(queryParams).length > 0) {
           const queryStr = new URLSearchParams(queryParams).toString();
           url += `?${queryStr}`;
        }
        return url;
      },
      providesTags: ['LessonVideos'],
    }),
    addLessonVideo: builder.mutation<any, any>({
      query: (data) => ({
        url: '/lesson-video/add',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LessonVideos'],
    }),
    deleteLessonVideo: builder.mutation<any, string>({
      query: (videoId) => ({
        url: `/lesson-video/${videoId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LessonVideos'],
    }),
    // --- ORGANIZATION DASHBOARD ---
    getOrgBasicDetails: builder.query<any, string>({
      query: (orgId) => `/org/school/basic?orgId=${orgId}`,
      transformResponse: (response: any) => response.data || null,
      providesTags: ['OrgDetails'],
    }),
    updateOrgBasicDetails: builder.mutation<any, any>({
      query: (data) => ({
        url: '/org/school/basic',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['OrgDetails'],
    }),
    getOrgFeeStructures: builder.query<any[], string>({
      query: (orgId) => `/org/school/fee?orgId=${orgId}`,
      transformResponse: (response: any) => response.data || [],
      providesTags: ['OrgDetails'],
    }),
    createOrgFeeStructure: builder.mutation<any, any>({
      query: (data) => ({
        url: '/org/school/fee',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['OrgDetails'],
    }),
    deleteOrgFeeStructure: builder.mutation<any, string>({
      query: (feeId) => ({
        url: `/org/school/fee/${feeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OrgDetails'],
    }),
    getOrgRoles: builder.query<any[], string>({
      query: (orgId) => `/org/school/roles?orgId=${orgId}`,
      transformResponse: (response: any) => response.data || [],
      providesTags: ['OrgDetails'],
    }),
    createOrgRole: builder.mutation<any, any>({
      query: (data) => ({
        url: '/org/school/roles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['OrgDetails'],
    }),
    deleteOrgRole: builder.mutation<any, string>({
      query: (roleId) => ({
        url: `/org/school/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OrgDetails'],
    }),
    getOrgStats: builder.query<any, string>({
      query: (orgId) => `/org/${orgId}/stats`,
      transformResponse: (response: any) => response.data || {},
      providesTags: ['OrgDetails'],
    }),
    // --- ADMIN NOTICES ---
    createAdminNotice: builder.mutation<any, any>({
      query: (data) => ({
        url: '/admin-notices/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AdminNotices'],
    }),
    getAdminNoticesByOrg: builder.query<any, string>({
      query: (orgId) => `/admin-notices/org/${orgId}`,
      providesTags: ['AdminNotices'],
    }),
    // --- VEHICLES ---
    getOrgVehicles: builder.query<any, string>({
      query: (orgId) => `/transport/vehicles/${orgId}`,
      providesTags: ['Transport'],
    }),
    getActiveVehicleLocations: builder.query<any, string>({
      query: (orgId) => `/transport/location/org/${orgId}`,
      providesTags: ['Transport'],
    }),
    getVehicleLocation: builder.query<any, string>({
      query: (vehicleId) => `/transport/location/${vehicleId}`,
      providesTags: ['Transport'],
    }),
    // --- ASSESSMENTS ---
    getAssessmentsByClass: builder.query<any, string>({
      query: (classId) => `/comprehensive-assessment/class/${classId}`,
    }),
    getAssessmentDetails: builder.query<any, string>({
      query: (assessmentId) => `/comprehensive-assessment/details/${assessmentId}`,
    }),
    submitAssessmentResult: builder.mutation<any, any>({
      query: (data) => ({
        url: `/comprehensive-result/assessment/${data.assessmentId}/result`,
        method: 'POST',
        body: data.payload,
      }),
    }),
    getStudentResults: builder.query<any, string>({
      query: (studentId) => `/comprehensive-result/student/${studentId}`,
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
  useGetOrganizationStatsQuery,
  useToggleOrganizationStatusMutation,
  useGetGlobalConfigsQuery,
  useUpdateGlobalConfigMutation,
  useGetTicketsQuery,
  useUpdateTicketStatusMutation,
  useCreateFeatureFlagDefinitionMutation,
  useGetFeatureFlagDefinitionsQuery,
  useToggleFeatureFlagForOrgMutation,
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
  useGetClassroomListQuery,
  useGetStudentNamesByClassQuery,
  useGetLibraryIssuesQuery,
  useIssueBookMutation,
  useReturnBookMutation,
  useDeleteLibraryIssueMutation,
  useGetClassroomsWithSubjectsQuery,
  useGetLessonVideosQuery,
  useAddLessonVideoMutation,
  useDeleteLessonVideoMutation,
  useGetOrgBasicDetailsQuery,
  useUpdateOrgBasicDetailsMutation,
  useGetOrgFeeStructuresQuery,
  useCreateOrgFeeStructureMutation,
  useDeleteOrgFeeStructureMutation,
  useGetOrgRolesQuery,
  useCreateOrgRoleMutation,
  useDeleteOrgRoleMutation,
  useGetOrgStatsQuery,
  useCreateAdminNoticeMutation,
  useGetAdminNoticesByOrgQuery,
  useGetOrgVehiclesQuery,
  useGetActiveVehicleLocationsQuery,
  useGetVehicleLocationQuery,
  useGetAssessmentsByClassQuery,
  useGetAssessmentDetailsQuery,
  useSubmitAssessmentResultMutation,
  useGetStudentResultsQuery,
} = apiSlice;
