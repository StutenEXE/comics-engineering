import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { parseDataToBook, type Book } from "~/models/book";
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

    /****************
     * BOOKS
     ****************/
    // Get book by id
    bookById: build.query<{ book: Book }, { id: number }>({
      query: ({ id }) => ({ url: `/book?id=${id}`, method: 'GET' }),
      transformResponse: (resp: { book: Book }) => ({
        book: parseDataToBook(resp.book),
      }),
    }),
    // Latest books endpoint (reuse parseDateLikeFields)
    latestBooks: build.query<{ books: Book[] }, { from: number; limit: number }>({
      query: ({ from, limit }) => ({ url: `/books/latest`, method: 'GET', params: { from, limit } }),
      transformResponse: (resp: { books: Book[] }) => ({
        books: resp.books.map((book) => parseDataToBook(book)),
      }),
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, 
  useBookByIdQuery, useLatestBooksQuery } 
  = publicApi;

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