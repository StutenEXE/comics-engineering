interface ContributionStatusStats {
    total: number,
    types: {
        book: number,
        serie: number,
        edition: number,
        issue: number,
        issueserie: number,
    }
}

interface ContributionsStats {
    total: number,
    status: {
        approved: ContributionStatusStats,
        rejected: ContributionStatusStats,
        pending: ContributionStatusStats,
        needs_revision: ContributionStatusStats,
        skipped: ContributionStatusStats
    }
}