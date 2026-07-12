import type { SimpleOwnedEdition } from "~/models/ownedEdition"

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

    spendingPerMonth?: Record<string, { totalPurchasePrice: number, totalFees: number, totalSpent: number }>
}