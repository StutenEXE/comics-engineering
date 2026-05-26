import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { parseToBook, parseToSimpleBook, type Book, type SimpleBook } from "~/models/book";
import { ContributionStatusEnum, parseToContribution, parseToSimpleContribution, type Contribution, type SimpleContribution } from "~/models/contribution";
import { ContributionBundleStatusEnum, parseToBundle, type ContributionBundle } from "~/models/contributionBundle";
import { parseToEdition, type Edition } from "~/models/edition";
import { parseToIssue, type Issue } from "~/models/issue";
import { parseToIssueSerie, type IssueSerie } from "~/models/issue-serie";
import { parseToOwnedEdition, type OwnedEdition } from "~/models/ownedEdition";
import { parseToPublisher, type Publisher } from "~/models/publisher";
import { parseToSerie, type Serie } from "~/models/serie";
import { parseToUser, type SignupData, type User, type UserCredentials } from "~/models/user";

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
    // Disconnect
    disconnect: build.query({
      query: () => ({ url: '/disconnect', method: 'GET' })
    }),
    // Refresh 
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
        book: parseToBook(resp.book),
      }),
    }),
    // Get book by serie id
    bookBySerieId: build.query<{ books: Book[] }, { id: number }>({
      query: (params) => ({ url: "/books/serie", method: 'GET', params: params }),
      transformResponse: (resp: { books: Book[] }) => ({
        books: resp.books.map((book) => parseToBook(book)),
      }),
    }),
    // Latest books endpoint (reuse parseDateLikeFields)
    latestBooks: build.query<{ books: SimpleBook[] }, { from: number, limit: number }>({
      query: (params) => ({ url: "/books/latest", method: 'GET', params: params }),
      transformResponse: (resp: { books: SimpleBook[] }) => ({
        books: resp.books.map((book) => parseToSimpleBook(book)),
      }),
    }),

    /****************
     * EDITIONS
     ****************/
    // Get edition by id
    editionById: build.query<{ edition: Edition }, { id: number }>({
      query: (params) => ({ url: "/editions", method: 'GET', params: params }),
      transformResponse: (resp: { edition: Edition }) => {
        console.log("Raw edition response:", resp);
        return ({
          edition: parseToEdition(resp.edition),
        })
      },
    }),

    /****************
     * ISSUE SERIES
     ****************/
    // Get issue serie by id
    issueSerieById: build.query<{ issueSerie: IssueSerie }, { id: number }>({
      query: (params) => ({ url: "/issueseries", method: 'GET', params: params }),
      transformResponse: (resp: { issueSerie: IssueSerie }) => ({
        issueSerie: parseToIssueSerie(resp.issueSerie),
      }),
    }),

    /****************
     * ISSUES
     ****************/
    // Get issue by id
    issueById: build.query<{ issue: Issue }, { id: number }>({
      query: (params) => ({ url: "/issues", method: 'GET', params: params }),
      transformResponse: (resp: { issue: Issue }) => ({
        issue: parseToIssue(resp.issue),
      }),
    }),
    // Get issue by book id
    issueByBookId: build.query<{ issues: Issue[] }, { id: number }>({
      query: (params) => ({ url: "/issues/book", method: 'GET', params: params }),
      transformResponse: (resp: { issues: Issue[] }) => ({
        issues: resp.issues.map((issue) => parseToIssue(issue)),
      }),
    }),

    /****************
     * PUBLISHER
     ****************/
    // Get publisher by id
    publisherById: build.query<{ publisher: Publisher }, { id: number }>({
      query: (params) => ({ url: "/publishers", method: 'GET', params: params }),
      transformResponse: (resp: { publisher: Publisher }) => ({
        publisher: parseToPublisher(resp.publisher),
      }),
    }),

    /****************
     * SERIES
     ****************/
    // Get serie by id
    serieById: build.query<{ serie: Serie }, { id: number }>({
      query: (params) => ({ url: "/series", method: 'GET', params: params }),
      transformResponse: (resp: { serie: Serie }) => ({
        serie: parseToSerie(resp.serie),
      }),
    }),

    /****************
     * SEARCH
     ****************/
    // Search books
    searchBooksByName: build.query<{ books: Book[] }, { query: string }>({
      query: ({ query }) => ({ url: "/search/books", method: 'GET', params: { query: query.trim().toLowerCase() } }),
      transformResponse: (resp: { books: Book[] }) => ({
        books: resp.books.map(parseToBook),
      }),
    }),
    // Search series
    searchSeriesByName: build.query<{ series: Serie[] }, { query: string }>({
      query: ({ query }) => ({ url: "/search/series", method: 'GET', params: { query: query.trim().toLowerCase() } }),
      transformResponse: (resp: { series: Serie[] }) => ({
        series: resp.series.map(parseToSerie),
      }),
    }),
    // Search publishers
    searchPublishersByName: build.query<{ publishers: Publisher[] }, { query: string }>({
      query: ({ query }) => ({ url: "/search/publishers", method: 'GET', params: { query: query.trim().toLowerCase() } }),
      transformResponse: (resp: { publishers: Publisher[] }) => ({
        publishers: resp.publishers.map(parseToPublisher),
      }),
    }),
    // Search issue series
    searchIssueSeriesByName: build.query<{ issueSeries: IssueSerie[] }, { query: string }>({
      query: ({ query }) => ({ url: "/search/issueseries", method: 'GET', params: { query: query.trim().toLowerCase() } }),
      transformResponse: (resp: { issueSeries: IssueSerie[] }) => ({
        issueSeries: resp.issueSeries.map(parseToIssueSerie),
      }),
    }),
    // Search books and series
    searchBooksAndSeriesByName: build.query<{ books: Book[], series: Serie[] }, { query: string }>({
      query: ({ query }) => ({ url: "/search/books_and_series", method: 'GET', params: { query: query.trim().toLowerCase() } }),
      transformResponse: (resp: { books: Book[], series: Serie[] }) => ({
        books: resp.books.map(parseToBook),
        series: resp.series.map(parseToSerie),
      }),
    }),

    /****************
   * CONTRIBUTIONS
   ****************/
    // Get contribution by id
    contributionBySubmitterId: build.query<{ contributions: Contribution[] }, { id: number }>({
      query: (params) => ({ url: "/contributions/submitter", method: 'GET', params: params }),
      transformResponse: (resp: { contributions: Contribution[] }) => ({
        contributions: resp.contributions.map(parseToContribution),
      }),
    }),
  }),
});

export const {
  useLoginMutation, useSignupMutation, useLazyDisconnectQuery, useRefreshQuery,
  useBookByIdQuery, useBookBySerieIdQuery, useLatestBooksQuery,
  useEditionByIdQuery,
  useIssueSerieByIdQuery,
  useIssueByIdQuery, useIssueByBookIdQuery,
  usePublisherByIdQuery,
  useSerieByIdQuery,
  useLazySearchBooksByNameQuery,
  useLazySearchSeriesByNameQuery,
  useLazySearchPublishersByNameQuery,
  useLazySearchIssueSeriesByNameQuery,
  // Lazyfy ?
  useSearchBooksAndSeriesByNameQuery,
  useContributionBySubmitterIdQuery
} = publicApi;


////////////////////////////////////
//////////// PRIVATE API ///////////
////////////////////////////////////

export const API_PVT_BASE_URL = "http://localhost:8080/api/comics/prv";

// RTK Query service for private API endpoints
export const privateApi = createApi({
  reducerPath: 'privateApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_PVT_BASE_URL, credentials: 'include' }),
  endpoints: (build) => ({
    /****************
     * USER COLLECTION
     ****************/
    collection: build.query<{ ownedEditions: OwnedEdition[] }, { id: number }>({
      query: (params) => ({ url: "/collection", method: 'GET', params: params }),
      transformResponse: (resp: { ownedEditions: OwnedEdition[] }) => ({
        ownedEditions: resp.ownedEditions.map(parseToOwnedEdition),
      }),
    }),

    /****************
     * CONTRIBUTIONS
     ****************/
    submitContributionBundle: build.mutation<{ bundleId: number }, Partial<ContributionBundle>>({
      query: (data) => ({ url: "/contribute", method: 'POST', body: data }),
    }),
    updateContributionBundle: build.mutation<{bundle: ContributionBundle}, Partial<ContributionBundle>>({
      query: (data) => ({ url: "/bundles/update", method: 'POST', body: data }),
    }),
  }),
});

export const { useCollectionQuery, useSubmitContributionBundleMutation, useUpdateContributionBundleMutation } = privateApi;


////////////////////////////////////
///////////// ADMIN API ////////////
////////////////////////////////////

export const API_ADM_BASE_URL = "http://localhost:8080/api/comics/adm";

// RTK Query service for private API endpoints
export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_ADM_BASE_URL, credentials: 'include' }),
  endpoints: (build) => ({
    // Get list of users
    userList: build.query<{ users: User[] }, { from: number, limit: number }>({
      query: (params) => ({ url: "/users/list", method: 'GET', params: params }),
      transformResponse: (resp: { users: User[] }) => ({
        users: resp.users.map((usr) => parseToUser(usr)),
      }),
    }),
    // Get list of contribution bundles
    bundleList: build.query<{ bundles: ContributionBundle[] }, { from: number, limit: number }>({
      query: (params) => ({ url: "/bundles/all", method: 'GET', params: params }),
      transformResponse: (resp: { bundles: ContributionBundle[] }) => ({
        bundles: resp.bundles.map((b) => parseToBundle(b)),
      }),
    }),
    // Create a contribution
    createContribution: build.mutation<{ contribution: Contribution }, Partial<SimpleContribution>>({
      query: (data) => ({ url: "/contributions/create", method: 'POST', body: data }),
      transformResponse: (resp: { contribution: Contribution }) => ({
        contribution: parseToContribution(resp.contribution),
      }),
    }),
    // Update a contribution
    updateContribution: build.mutation<{ contribution: SimpleContribution }, Partial<SimpleContribution>>({
      query: (data) => ({ url: "/contributions/update", method: 'POST', body: data }),
      transformResponse: (resp: { contribution: SimpleContribution }) => ({
        contribution: parseToSimpleContribution(resp.contribution),
      }),
    }),
    // Update the status of a contribution
    updateContributionStatus: build.mutation<{}, { contributionId: number, newStatus: ContributionStatusEnum }>({
      query: ({ contributionId, newStatus }) => ({ url: "/contributions/update-status", method: 'POST', body: { contributionId, newStatus } }),
    }),
    // Update the status of a contribution bundle
    updateBundleStatus: build.mutation<{}, { bundleId: number, newStatus: ContributionBundleStatusEnum }>({
      query: ({ bundleId, newStatus }) => ({ url: "/bundles/update-status", method: 'POST', body: { bundleId, newStatus } }),
    }),
  }),
});

export const {
  useUserListQuery,
  useLazyBundleListQuery,
  useCreateContributionMutation,
  useUpdateContributionMutation,
  useUpdateContributionStatusMutation,
  useUpdateBundleStatusMutation
} = adminApi;