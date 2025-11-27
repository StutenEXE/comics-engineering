import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Book } from "~/models/book";
import type { SignupData, User, UserCredentials } from "~/models/user";

//////////// PUBLIC API ////////////

export const API_PUB_BASE_URL = "http://localhost:8080/api/comics/pub";

// RTK Query service for public API endpoints
export const publicApi = createApi({
  reducerPath: 'publicApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_PUB_BASE_URL, credentials: 'include' }),
  endpoints: (build) => ({
    // Login API endpoint
    login: build.mutation<{ user: User }, UserCredentials>({
      query: (credentials) => ({ url: '/login', method: 'POST', body: credentials }),
    }),
    // Signup API endpoint
    signup: build.mutation<{ user: User }, SignupData>({
      query: (data) => ({ url: '/signup', method: 'POST', body: data }),
    }),
    // Latest books endpoint
    latestBooks: build.query<{ books: Book[] }, { from: number; limit: number }>({
      query: ({ from, limit }) => ({ url: `/books/latest?from=${from}&limit=${limit}`, method: 'GET' }),
      transformResponse: (reps: {books: Book[]}) => ({
          books: reps.books.map(book => ({
            ...book,
            createdAt: new Date(book.createdAt),
            modifiedAt:new Date(book.modifiedAt),
          })),
      }),
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useLatestBooksQuery } = publicApi;

//////////// PRIVATE API ////////////

export const API_PVT_BASE_URL = "http://localhost:8080/api/comics/pvt";

// RTK Query service for private API endpoints
export const privateApi = createApi({
  reducerPath: 'privateApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_PVT_BASE_URL, credentials: 'include' }),
  endpoints: (build) => ({
    // Define private endpoints here
  }),
});

export const {  } = privateApi;