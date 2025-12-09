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
    bookById: build.query<{ book: Book }, { id: number, withSerie: boolean, withEditions: boolean, withIssues: boolean, withUser: boolean }>({
      query: (params) => ({ url: "/books", method: 'GET', params: params }),
      transformResponse: (resp: { book: Book }) => ({
        book: parseDataToBook(resp.book),
      }),
    }),
    // Get book by serie id
    bookBySerieId: build.query<{ books: Book[] }, { id: number, withSerie: boolean, withEditions: boolean, withIssues: boolean, withUser: boolean }>({
      query: (params) => ({ url: "/books/serie", method: 'GET', params: params }),
      transformResponse: (resp: { books: Book[] }) => ({
        books: resp.books.map((book) => parseDataToBook(book)),
      }),
    }),
    // Latest books endpoint (reuse parseDateLikeFields)
    latestBooks: build.query<{ books: Book[] }, { from: number; limit: number, withSerie: boolean, withEditions: boolean, withIssues: boolean, withUser: boolean }>({
      query: (params) => ({ url: "/books/latest", method: 'GET', params: params }),
      transformResponse: (resp: { books: Book[] }) => ({
        books: resp.books.map((book) => parseDataToBook(book)),
      }),
    }),

    /****************
     * EDITIONS
     ****************/
    // Get edition by id
    editionById: build.query<{ edition: Edition }, { id: number, withPublisher: boolean, withBook: boolean, withUser: boolean }>({
      query: (params) => ({ url: "/editions", method: 'GET', params: params }),
      transformResponse: (resp: { edition: Edition }) => ({
        edition: parseDataToEdition(resp.edition),
      }),
    }),

    /****************
     * ISSUE SERIES
     ****************/
    // Get issue serie by id
    issueSerieById: build.query<{ issueSerie: IssueSerie }, { id: number, withIssues: boolean, withUser: boolean }>({
      query: (params) => ({ url: "/issueseries", method: 'GET', params: params }),
      transformResponse: (resp: { issueSerie: IssueSerie }) => ({
        issueSerie: parseDataToIssueSerie(resp.issueSerie),
      }),
    }),

    /****************
     * ISSUES
     ****************/
    // Get issue by id
    issueById: build.query<{ issue: Issue }, { id: number, withIssueSerie: boolean, withBooks: boolean, withUser: boolean }>({
      query: (params) => ({ url: "/issues", method: 'GET', params: params }),
      transformResponse: (resp: { issue: Issue }) => ({
        issue: parseDataToIssue(resp.issue),
      }),
    }),
    // Get issue by book id
    issueByBookId: build.query<{ issues: Issue[] }, { id: number, withIssueSerie: boolean, withBooks: boolean, withUser: boolean }>({
      query: (params) => ({ url: "/issues/book", method: 'GET', params: params }),
      transformResponse: (resp: { issues: Issue[] }) => ({
        issues: resp.issues.map((issue) => parseDataToIssue(issue)),
      }),
    }),

    /****************
     * PUBLISHER
     ****************/
    // Get publisher by id
    publisherById: build.query<{ publisher: Publisher }, { id: number, withEditions: boolean }>({
      query: (params) => ({ url: "/publishers", method: 'GET', params: params }),
      transformResponse: (resp: { publisher: Publisher }) => ({
        publisher: parseDataToPublisher(resp.publisher),
      }),
    }),

    /****************
     * SERIES
     ****************/
    // Get serie by id
    serieById: build.query<{ serie: Serie }, { id: number, withBooks: boolean, withUser: boolean }>({
      query: (params) => ({ url: "/series", method: 'GET', params: params }),
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