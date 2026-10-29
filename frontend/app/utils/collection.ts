import type { OwnedEdition } from "~/models/ownedEdition";
import type { SimpleSerie } from "~/models/serie";
import { calcCost } from "./currency";

export interface SerieSpendingSummary {
    serie: SimpleSerie,
    // Owned editions of the serie (a book can be owned in several editions)
    nEditions: number,
    // Distinct books owned, to compare with serie.nvolumes
    nBooks: number,
    purchasePrice: number,
    fees: number,
    totalCost: number,
    retailPrice: number,
    savings: number,
    // In percent of the retail price
    reduction: number,
}

/**
 * Totals of costs and savings of owned editions, by serie.
 * Editions without a serie are ignored.
 */
export function summarizeBySerie(oeditions: OwnedEdition[]): SerieSpendingSummary[] {
    const bySerie = new Map<number, { serie: SimpleSerie, oeditions: OwnedEdition[] }>()
    for (const oe of oeditions) {
        const serie = oe.edition.serie
        if (!serie) continue
        const group = bySerie.get(serie.id) ?? { serie, oeditions: [] }
        group.oeditions.push(oe)
        bySerie.set(serie.id, group)
    }
    return [...bySerie.values()].map(({ serie, oeditions }) => summarize(serie, oeditions))
}

export function summarize(serie: SimpleSerie, oeditions: OwnedEdition[]): SerieSpendingSummary {
    const sum = (f: (oe: OwnedEdition) => number) => oeditions.reduce((acc, oe) => acc + (f(oe) || 0), 0)
    const totalCost = sum(calcCost)
    const retailPrice = sum((oe) => oe.retailPrice)
    const savings = retailPrice - totalCost
    return {
        serie,
        nEditions: oeditions.length,
        nBooks: new Set(oeditions.map((oe) => oe.edition.book?.id ?? `edition-${oe.edition.id}`)).size,
        purchasePrice: sum((oe) => oe.purchasePrice),
        fees: sum((oe) => oe.fees),
        totalCost,
        retailPrice,
        savings,
        // No division by 0 when retail prices are unknown
        reduction: retailPrice > 0 ? (savings / retailPrice) * 100 : 0,
    }
}
