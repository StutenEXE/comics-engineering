import { createApi, fetchBaseQuery, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { parseDataToBook, type Book } from "~/models/book";
import { parseDataToEdition, type Edition } from "~/models/edition";
import { parseDataToIssue, type Issue } from "~/models/issue";
import { parseDataToIssueSerie, type IssueSerie } from "~/models/issue-serie";
import { parseDataToPublisher, type Publisher } from "~/models/publisher";
import { parseDataToSerie, type Serie } from "~/models/serie";
import type { SignupData, User, UserCredentials } from "~/models/user";

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

    /****************
     * BOOKS
     ****************/
    // Get book by id
    bookById: build.query<{ book: Book }, { id: number }>({
      query: ({ id }) => ({ url: "/books", method: 'GET', params: { id } }),
      transformResponse: (resp: { book: Book }) => ({
        book: parseDataToBook(resp.book),
      }),
    }),
    // Get book by serie id
    bookBySerieId: build.query<{ books: Book[] }, { id: number }>({
      query: ({ id }) => ({ url: "/books/serie", method: 'GET', params: { id } }),
      transformResponse: (resp: { books: Book[] }) => ({
        books: resp.books.map((book) => parseDataToBook(book)),
      }),
    }),
    // Latest books endpoint (reuse parseDateLikeFields)
    latestBooks: build.query<{ books: Book[] }, { from: number; limit: number }>({
      query: ({ from, limit }) => ({ url: "/books/latest", method: 'GET', params: { from, limit } }),
      transformResponse: (resp: { books: Book[] }) => ({
        books: resp.books.map((book) => parseDataToBook(book)),
      }),
    }),

    /****************
     * EDITIONS
     ****************/
    // Get edition by id
    editionById: build.query<{ edition: Edition }, { id: number }>({
      query: ({ id }) => ({ url: "/editions", method: 'GET', params: { id } }),
      transformResponse: (resp: { edition: Edition }) => ({
        edition: parseDataToEdition(resp.edition),
      }),
    }),

    /****************
     * ISSUE SERIES
     ****************/
    // Get issue serie by id
    issueSerieById: build.query<{ issueSerie: IssueSerie }, { id: number }>({
      query: ({ id }) => ({ url: "/issueseries", method: 'GET', params: { id } }),
      transformResponse: (resp: { issueSerie: IssueSerie }) => ({
        issueSerie: parseDataToIssueSerie(resp.issueSerie),
      }),
    }),

    /****************
     * ISSUES
     ****************/
    // Get issue by id
    issueById: build.query<{ issue: Issue }, { id: number }>({
      query: ({ id }) => ({ url: "/issues", method: 'GET', params: { id } }),
      transformResponse: (resp: { issue: Issue }) => ({
        issue: parseDataToIssue(resp.issue),
      }),
    }),
    // Get issue by book id
    issueByBookId: build.query<{ issues: Issue[] }, { id: number }>({
      query: ({ id }) => ({ url: "/issues/book", method: 'GET', params: { id } }),
      transformResponse: (resp: { issues: Issue[] }) => ({
        issues: resp.issues.map((issue) => parseDataToIssue(issue)),
      }),
    }),

    /****************
     * PUBLISHER
     ****************/
    // Get publisher by id
    publisherById: build.query<{ publisher: Publisher }, { id: number }>({
      query: ({ id }) => ({ url: "/publishers", method: 'GET', params: { id } }),
      transformResponse: (resp: { publisher: Publisher }) => ({
        publisher: parseDataToPublisher(resp.publisher),
      }),
    }),

    /****************
     * SERIES
     ****************/
    // Get issue by id
    serieById: build.query<{ serie: Serie }, { id: number }>({
      query: ({ id }) => ({ url: "/series", method: 'GET', params: { id } }),
      transformResponse: (resp: { serie: Serie }) => ({
        serie: parseDataToSerie(resp.serie),
      }),
    }),
  }),
});

export const { 
  useLoginMutation, useSignupMutation, 
  useBookByIdQuery, useBookBySerieIdQuery, useLatestBooksQuery,
  useEditionByIdQuery,
  useIssueSerieByIdQuery,
  useIssueByIdQuery, useIssueByBookIdQuery,
  usePublisherByIdQuery,
  useSerieByIdQuery
 } 
  = publicApi;


////////////////////////////////////
//////////// PRIVATE API ////////////
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