import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import { publicApi, privateApi } from './services/api';

export const store = configureStore({
  reducer: {
    user: userReducer,
    [publicApi.reducerPath]: publicApi.reducer,
    [privateApi.reducerPath]: privateApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }).concat(publicApi.middleware, privateApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
