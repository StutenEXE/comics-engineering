import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '~/models/user';
import { publicApi } from '../services/api';

export interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      publicApi.endpoints.refresh.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.user;
        state.isLoading = false;
      }
    );
    builder.addMatcher(
      publicApi.endpoints.refresh.matchRejected,
      (state) => {
        state.isLoading = false;
      }
    );
  },
});

export const { setUser, clearUser, setLoading, setError, updateUser, setAuthenticated } = userSlice.actions;
export default userSlice.reducer;
