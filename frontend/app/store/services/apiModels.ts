import type { SimpleOwnedEdition } from "~/models/ownedEdition"

// Pagination parameters of a list request
export interface PageRequest {
    // Number of items to skip before the first returned item
    offset: number,
    // Maximum number of items to return (page size, max 100)
    limit: number,
}

// Sorting parameters of a list request, the accepted fields depend on the endpoint
export interface SortRequest<F extends string = string> {
    sortField?: F,
    sortDirection?: "asc" | "desc",
}

// One page of a paginated list
export interface Page<T> {
    items: T[],
    // Total number of items matching the request (all pages)
    total: number,
    offset: number,
    limit: number,
}

// Filters of the user list, an undefined filter is not applied
export interface UserListFilters {
    id?: number,
    // Username containing this text
    username?: string,
    // Email containing this text
    email?: string,
    isAdmin?: boolean,
    isDeleted?: boolean,
}

export type UserSortField = "id" | "username" | "email" | "createdAt" | "isAdmin" | "isDeleted";

// Filters of the contribution bundle list, an undefined filter is not applied
export interface BundleListFilters {
    id?: number,
    // Submitter username containing this text
    submitter?: string,
    // Note containing this text
    note?: string,
    status?: string,
}

// Filters of a user's collection, an undefined filter is not applied
export interface CollectionFilters {
    // Book name containing this text
    bookName?: string,
    // Serie name containing this text
    serieName?: string,
    publisherId?: number,
    // Publisher name containing this text
    publisherName?: string,
    read?: boolean,
}

export type CollectionSortField = "id" | "bookName" | "serieName" | "volume" | "publisherName" | "addDate" | "read";

export type BundleSortField = "id" | "submitter" | "note" | "createdAt" | "status" | "nContributions";

export interface ContributionStatusStats {
    total: number,
    types: {
        book: number,
        serie: number,
        edition: number,
        issue: number,
        issueserie: number,
    }
}

export interface ContributionsStats {
    total: number,
    status: {
        approved: ContributionStatusStats,
        rejected: ContributionStatusStats,
        pending: ContributionStatusStats,
        needs_revision: ContributionStatusStats,
        skipped: ContributionStatusStats
    }
}

export interface OwnedEditionSpendingStats {
    totalSpent: number,
    totalPurchasePrice: number,
    totalFees: number,
    totalRetailPrice: number,

    totalSavings: number,
    totalSavingsPercentage: number,

    mostCostlyEdition?: SimpleOwnedEdition,
    mostValuableEdition?: SimpleOwnedEdition,
    bestDealObtainedByPrice?: SimpleOwnedEdition,
    bestDealObtainedByReduction?: SimpleOwnedEdition,
}

export interface OwnedEditionMonthlySpendingStats {
    spendingPerMonth?: Record<string, {
        totalPurchasePrice: number,
        totalFees: number,
        totalSpent: number,

        totalBooksBought: number,
        totalBooksGifted: number,
        totalBooksAdded: number
    }>
}

export interface OwnedEditionReadingStats {
    totalBooksRead: number,
    totalBooksNotRead: number,

    totalIssuesRead: number,
    totalIssuesNotRead: number,

    totalPagesRead: number,
    totalPagesNotRead: number,

    // In meters
    distanceRead: number,
    // In meters
    distanceNotRead: number,

    valueRead: number,
    valueNotRead: number,
}

export interface OwnedEditionMonthlyReadingStats {
    readingPerMonth?: Record<string, {
        numberOfBooksRead: number,
        numberOfIssuesRead: number,
        numberOfPagesRead: number
    }>
    nBooksReadWithNoDate: number
}
