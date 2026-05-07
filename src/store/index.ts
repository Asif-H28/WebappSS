import { configureStore, combineReducers } from '@reduxjs/toolkit';
import themeReducer from './themeSlice.ts';
import authReducer from './authSlice.ts';
import { apiSlice } from './apiSlice.ts';

const rootReducer = combineReducers({
  theme: themeReducer,
  auth: authReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
