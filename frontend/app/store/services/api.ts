import { createApi, fetchBaseQuery, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { parseDataToBook, type Book } from "~/models/book";
import { parseDataToEdition, type Edition } from "~/models/edition";
import { parseDataToIssue, type Issue } from "~/models/issue";
import { parseDataToIssueSerie, type IssueSerie } from "~/models/issue-serie";
import { parseDataToPublisher, type Publisher } from "~/models/publisher";
import { parseDataToSerie, type Serie } from "~/models/serie";
import { parseDataToUser, type SignupData, type User, type UserCredentials } from "~/models/user";

////////////////////////////////////
//////////// PUBLIC API ////////////
////////////////////////////////////
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
    refresh: build.query({
      query: () => ({ url: '/refresh', method: 'GET' }),
    }),

    /****************
     * BOOKS
     ****************/
    // Get book by id
    bookById: build.query<{ book: Book }, { id: number }>({
      query: (params) => ({ url: "/books", method: 'GET', params: params }),
      transformResponse: (resp: { book: Book }) => ({
        book: parseDataToBook(resp.book),
      }),
    }),
    // Get book by serie id
    bookBySerieId: build.query<{ books: Book[] }, { id: number }>({
      query: (params) => ({ url: "/books/serie", method: 'GET', params: params }),
      transformResponse: (resp: { books: Book[] }) => ({
        books: resp.books.map((book) => parseDataToBook(book)),
      }),
    }),
    // Latest books endpoint (reuse parseDateLikeFields)
    latestBooks: build.query<{ books: Book[] }, { from: number, limit: number }>({
      query: (params) => ({ url: "/books/latest", method: 'GET', params: params }),
      transformResponse: (resp: { books: Book[] }) => ({
        books: resp.books.map((book) => parseDataToBook(book)),
      }),
    }),

    /****************
     * EDITIONS
     ****************/
    // Get edition by id
    editionById: build.query<{ edition: Edition }, { id: number }>({
      query: (params) => ({ url: "/editions", method: 'GET', params: params }),
      transformResponse: (resp: { edition: Edition }) => ({
        edition: parseDataToEdition(resp.edition),
      }),
    }),

    /****************
     * ISSUE SERIES
     ****************/
    // Get issue serie by id
    issueSerieById: build.query<{ issueSerie: IssueSerie }, { id: number }>({
      query: (params) => ({ url: "/issueseries", method: 'GET', params: params }),
      transformResponse: (resp: { issueSerie: IssueSerie }) => ({
        issueSerie: parseDataToIssueSerie(resp.issueSerie),
      }),
    }),

    /****************
     * ISSUES
     ****************/
    // Get issue by id
    issueById: build.query<{ issue: Issue }, { id: number }>({
      query: (params) => ({ url: "/issues", method: 'GET', params: params }),
      transformResponse: (resp: { issue: Issue }) => ({
        issue: parseDataToIssue(resp.issue),
      }),
    }),
    // Get issue by book id
    issueByBookId: build.query<{ issues: Issue[] }, { id: number }>({
      query: (params) => ({ url: "/issues/book", method: 'GET', params: params }),
      transformResponse: (resp: { issues: Issue[] }) => ({
        issues: resp.issues.map((issue) => parseDataToIssue(issue)),
      }),
    }),

    /****************
     * PUBLISHER
     ****************/
    // Get publisher by id
    publisherById: build.query<{ publisher: Publisher }, { id: number }>({
      query: (params) => ({ url: "/publishers", method: 'GET', params: params }),
      transformResponse: (resp: { publisher: Publisher }) => ({
        publisher: parseDataToPublisher(resp.publisher),
      }),
    }),

    /****************
     * SERIES
     ****************/
    // Get serie by id
    serieById: build.query<{ serie: Serie }, { id: number }>({
      query: (params) => ({ url: "/series", method: 'GET', params: params }),
      transformResponse: (resp: { serie: Serie }) => ({
        serie: parseDataToSerie(resp.serie),
      }),
    }),

    /****************
     * SEARCH
     ****************/
    // Get serie by id
    searchBooksAndSeriesByName: build.query<{ books: Book[], series: Serie[] }, { query: string }>({
      query: ({ query }) => ({ url: "/search/books_and_series", method: 'GET', params: { query: query.trim().toLowerCase() } }),
      transformResponse: (resp: { books: Book[], series: Serie[] }) => ({
        books: resp.books.map(parseDataToBook),
        series: resp.series.map(parseDataToSerie),
      }),
    }),
  }),
});

export const { 
  useLoginMutation, useSignupMutation, useRefreshQuery,
  useBookByIdQuery, useBookBySerieIdQuery, useLatestBooksQuery,
  useEditionByIdQuery,
  useIssueSerieByIdQuery,
  useIssueByIdQuery, useIssueByBookIdQuery,
  usePublisherByIdQuery,
  useSerieByIdQuery,
  useSearchBooksAndSeriesByNameQuery
 } 
  = publicApi;


////////////////////////////////////
//////////// PRIVATE API ///////////
////////////////////////////////////

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


////////////////////////////////////
///////////// ADMIN API ////////////
////////////////////////////////////

export const API_ADM_BASE_URL = "http://localhost:8080/api/comics/adm";

// RTK Query service for private API endpoints
export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_ADM_BASE_URL, credentials: 'include' }),
  endpoints: (build) => ({
    /****************
     * SERIES
     ****************/
    // Get list of users
    userList: build.query<{ users: User[] }, { from: number, limit: number }>({
      query: (params) => ({ url: "/users/list", method: 'GET', params: params }),
      transformResponse: (resp: { users: User[] }) => ({
        users: resp.users.map((usr) => parseDataToUser(usr)),
      }),
    }),
  }),
});

export const { 
  useUserListQuery
 } = adminApi;