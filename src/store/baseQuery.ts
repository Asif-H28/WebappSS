import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from './index.ts';
import { logout } from './authSlice.ts';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Redux auth state token (Super Admin)
    const token = (getState() as RootState).auth.token;
    
    // Local storage token (Web Dashboard / Org Admin / Support Staff)
    const webToken = localStorage.getItem('webToken');
    
    // Prefer webToken if it exists, otherwise fallback to Redux token
    const activeToken = webToken || token;

    if (activeToken) {
      headers.set('authorization', `Bearer ${activeToken}`);
    }
    
    return headers;
  },
});

export const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait for the initial query to complete
  let result = await baseQuery(args, api, extraOptions);

  // Intercept 401 Unauthorized responses
  if (result.error && result.error.status === 401) {
    // 1. Clear Redux state
    api.dispatch(logout());
    
    // 2. Clear all local storage
    localStorage.clear();
    
    // 3. Redirect user to login page
    window.location.href = '/org/login';
  }

  return result;
};
