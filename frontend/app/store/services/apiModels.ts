import type { SimpleOwnedEdition } from "~/models/ownedEdition"

export interface Pagination {
    page: number,
    size: number,
}

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
