import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  user: any | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('sa_token'),
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: any }>
    ) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      localStorage.setItem('sa_token', token);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('sa_token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
