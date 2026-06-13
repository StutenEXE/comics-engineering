import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ScrapeResult } from "./scrapersModels";

const SCRAPER_HOST = (import.meta.env.VITE_SCRAPER_HOST as string | undefined) ?? "http://localhost:8081";

export const SCRAPER_BASE_URL = `${SCRAPER_HOST}/api/scraper/`;

// RTK Query service for public API endpoints
export const scraper = createApi({
  reducerPath: 'scraper',
  baseQuery: fetchBaseQuery({ baseUrl: SCRAPER_BASE_URL, credentials: 'omit' }),
  endpoints: (build) => ({
    scrapeUrl: build.query<ScrapeResult, { url: string }>({
      query: (data) => ({ url: '/scrape', method: 'POST', body: data })
    }),
    scrapeIsbn: build.query<ScrapeResult, { isbn: string }>({
      query: (data) => ({ url: '/isbn', method: 'POST', body: data })
    }),
  }),
});

export const {
  useLazyScrapeUrlQuery,
  useLazyScrapeIsbnQuery
} = scraper;

