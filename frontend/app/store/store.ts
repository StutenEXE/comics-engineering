import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import localeReducer from './slices/localeSlice';
import { publicApi, privateApi, adminApi } from './services/api';
import { scraper } from './services/scrapers';

export const store = configureStore({
  reducer: {
    user: userReducer,
    locale: localeReducer,
    [publicApi.reducerPath]: publicApi.reducer,
    [privateApi.reducerPath]: privateApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [scraper.reducerPath]: scraper.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }).concat(publicApi.middleware, privateApi.middleware, adminApi.middleware, scraper.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
